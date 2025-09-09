import express from 'express';
import { body, validationResult } from 'express-validator';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Lesson validation rules
const lessonValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
    .trim(),
  body('level')
    .isIn(['A1/Beginner', 'A2/Elementary', 'B1/Pre-Intermediate', 'B2/Intermediate', 'C1/Upper-Intermediate', 'C2/Advanced'])
    .withMessage('Invalid level'),
  body('objectives')
    .isArray({ min: 1 })
    .withMessage('At least one objective is required'),
  body('grammar')
    .isArray({ min: 1 })
    .withMessage('At least one grammar section is required'),
  body('examples')
    .isArray({ min: 1 })
    .withMessage('At least one example section is required'),
  body('exercises')
    .isObject()
    .withMessage('Exercises object is required')
];

// @route   GET /api/lessons
// @desc    Get all lessons (public and user's private lessons)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      level, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isPublic 
    } = req.query;

    const query = {
      $or: [
        { isPublic: true, isPublished: true },
        { author: req.userId }
      ]
    };

    // Add filters
    if (level) {
      query.level = level;
    }

    if (search) {
      query.$and = [
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { objectives: { $regex: search, $options: 'i' } },
            { 'metadata.tags': { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    if (isPublic !== undefined) {
      query.isPublic = isPublic === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const lessons = await Lesson.find(query)
      .populate('author', 'username profile.firstName profile.lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-exercises'); // Exclude exercises for list view

    const total = await Lesson.countDocuments(query);

    res.json({
      success: true,
      data: {
        lessons,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/lessons/public
// @desc    Get public lessons only
// @access  Public
router.get('/public', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      level, 
      search, 
      sortBy = 'stats.averageRating',
      sortOrder = 'desc'
    } = req.query;

    const query = {
      isPublic: true,
      isPublished: true
    };

    // Add filters
    if (level) {
      query.level = level;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { objectives: { $regex: search, $options: 'i' } },
        { 'metadata.tags': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const lessons = await Lesson.find(query)
      .populate('author', 'username profile.firstName profile.lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-exercises'); // Exclude exercises for list view

    const total = await Lesson.countDocuments(query);

    res.json({
      success: true,
      data: {
        lessons,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get public lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/lessons/my
// @desc    Get user's own lessons
// @access  Private
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { author: req.userId };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const lessons = await Lesson.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lesson.countDocuments(query);

    res.json({
      success: true,
      data: {
        lessons,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/lessons/:id
// @desc    Get single lesson by ID
// @access  Private (or Public if lesson is public)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check access permissions
    const isOwner = req.userId && lesson.author._id.toString() === req.userId;
    const isPublic = lesson.isPublic && lesson.isPublished;

    if (!isOwner && !isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Increment view count if not owner
    if (!isOwner) {
      await lesson.incrementViews();
    }

    res.json({
      success: true,
      data: { lesson }
    });

  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/lessons
// @desc    Create a new lesson
// @access  Private
router.post('/', authenticateToken, lessonValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const lessonData = {
      ...req.body,
      author: req.userId
    };

    const lesson = new Lesson(lessonData);
    await lesson.save();

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'stats.lessonsCreated': 1 }
    });

    // Populate author info
    await lesson.populate('author', 'username profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: { lesson }
    });

  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/lessons/:id
// @desc    Update a lesson
// @access  Private (owner only)
router.put('/:id', authenticateToken, lessonValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check ownership
    if (lesson.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update lesson
    Object.assign(lesson, req.body);
    await lesson.save();

    // Populate author info
    await lesson.populate('author', 'username profile.firstName profile.lastName');

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: { lesson }
    });

  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/lessons/:id
// @desc    Delete a lesson
// @access  Private (owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check ownership
    if (lesson.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Lesson.findByIdAndDelete(req.params.id);

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'stats.lessonsCreated': -1 }
    });

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/lessons/:id/complete
// @desc    Mark lesson as completed
// @access  Private
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check access permissions
    const isOwner = lesson.author.toString() === req.userId;
    const isPublic = lesson.isPublic && lesson.isPublished;

    if (!isOwner && !isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Increment completion count
    await lesson.incrementCompletions();

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 
        'stats.exercisesCompleted': 1,
        'stats.totalStudyTime': lesson.metadata.estimatedTime || 30
      }
    });

    res.json({
      success: true,
      message: 'Lesson marked as completed'
    });

  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/lessons/:id/rate
// @desc    Rate a lesson
// @access  Private
router.post('/:id/rate', authenticateToken, [
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating } = req.body;
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check access permissions
    const isOwner = lesson.author.toString() === req.userId;
    const isPublic = lesson.isPublic && lesson.isPublished;

    if (!isOwner && !isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update rating
    await lesson.updateRating(rating);

    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });

  } catch (error) {
    console.error('Rate lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
