import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  level: {
    type: String,
    required: [true, 'Lesson level is required'],
    enum: ['A1/Beginner', 'A2/Elementary', 'B1/Pre-Intermediate', 'B2/Intermediate', 'C1/Upper-Intermediate', 'C2/Advanced']
  },
  objectives: [{
    type: String,
    trim: true,
    maxlength: [300, 'Objective cannot exceed 300 characters']
  }],
  prerequisites: [{
    type: String,
    trim: true,
    maxlength: [200, 'Prerequisite cannot exceed 200 characters']
  }],
  grammar: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Grammar title cannot exceed 100 characters']
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Summary cannot exceed 1000 characters']
    },
    points: [{
      type: String,
      trim: true,
      maxlength: [500, 'Point cannot exceed 500 characters']
    }],
    patterns: [{
      type: String,
      trim: true,
      maxlength: [200, 'Pattern cannot exceed 200 characters']
    }],
    notes: [{
      type: String,
      trim: true,
      maxlength: [300, 'Note cannot exceed 300 characters']
    }],
    time_markers: [{
      type: String,
      trim: true,
      maxlength: [100, 'Time marker cannot exceed 100 characters']
    }],
    usage_contexts: [{
      type: String,
      trim: true,
      maxlength: [300, 'Usage context cannot exceed 300 characters']
    }],
    common_mistakes: [{
      type: String,
      trim: true,
      maxlength: [300, 'Common mistake cannot exceed 300 characters']
    }]
  }],
  examples: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Example title cannot exceed 100 characters']
    },
    items: [{
      en: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'English example cannot exceed 500 characters']
      },
      vi: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Vietnamese translation cannot exceed 500 characters']
      },
      explain: {
        type: String,
        trim: true,
        maxlength: [300, 'Explanation cannot exceed 300 characters']
      }
    }]
  }],
  exercises: {
    recognition: [{
      id: {
        type: String,
        required: true,
        trim: true
      },
      prompt: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Prompt cannot exceed 500 characters']
      },
      choices: [{
        type: String,
        trim: true,
        maxlength: [200, 'Choice cannot exceed 200 characters']
      }],
      answer: {
        type: Number,
        required: true,
        min: 0
      },
      explain: {
        type: String,
        trim: true,
        maxlength: [300, 'Explanation cannot exceed 300 characters']
      }
    }],
    gap_fill: [{
      id: {
        type: String,
        required: true,
        trim: true
      },
      sentence: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Sentence cannot exceed 500 characters']
      },
      blank: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, 'Blank cannot exceed 50 characters']
      },
      options: [{
        type: String,
        trim: true,
        maxlength: [100, 'Option cannot exceed 100 characters']
      }],
      answer: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Answer cannot exceed 100 characters']
      },
      explain: {
        type: String,
        trim: true,
        maxlength: [300, 'Explanation cannot exceed 300 characters']
      }
    }],
    transformation: [{
      id: {
        type: String,
        required: true,
        trim: true
      },
      source: {
        type: String,
        required: true,
        trim: true,
        maxlength: [300, 'Source sentence cannot exceed 300 characters']
      },
      instruction: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Instruction cannot exceed 200 characters']
      },
      answer: {
        type: String,
        required: true,
        trim: true,
        maxlength: [300, 'Answer cannot exceed 300 characters']
      },
      explain: {
        type: String,
        trim: true,
        maxlength: [300, 'Explanation cannot exceed 300 characters']
      }
    }],
    error_correction: [{
      id: {
        type: String,
        required: true,
        trim: true
      },
      sentence: {
        type: String,
        required: true,
        trim: true,
        maxlength: [400, 'Sentence cannot exceed 400 characters']
      },
      error_hint: {
        type: String,
        trim: true,
        maxlength: [200, 'Error hint cannot exceed 200 characters']
      },
      answer: {
        type: String,
        required: true,
        trim: true,
        maxlength: [400, 'Answer cannot exceed 400 characters']
      },
      explain: {
        type: String,
        trim: true,
        maxlength: [300, 'Explanation cannot exceed 300 characters']
      }
    }],
    free_production: [{
      id: {
        type: String,
        required: true,
        trim: true
      },
      task: {
        type: String,
        required: true,
        trim: true,
        maxlength: [300, 'Task cannot exceed 300 characters']
      },
      sample: {
        type: String,
        trim: true,
        maxlength: [500, 'Sample cannot exceed 500 characters']
      }
    }]
  },
  video: {
    videoId: {
      type: String,
      trim: true
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Video title cannot exceed 200 characters']
    },
    channel: {
      type: String,
      trim: true,
      maxlength: [100, 'Channel name cannot exceed 100 characters']
    },
    url: {
      type: String,
      trim: true
    },
    viewCount: {
      type: String,
      trim: true
    }
  },
  metadata: {
    createdWithGemini: {
      type: Boolean,
      default: false
    },
    aiModel: {
      type: String,
      default: 'gemini-2.5-flash'
    },
    generationTime: {
      type: Number, // in milliseconds
      default: 0
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    estimatedTime: {
      type: Number, // in minutes
      default: 30
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [50, 'Tag cannot exceed 50 characters']
    }]
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
lessonSchema.index({ title: 'text', 'objectives': 'text' });
lessonSchema.index({ author: 1, createdAt: -1 });
lessonSchema.index({ level: 1 });
lessonSchema.index({ isPublic: 1, isPublished: 1 });
lessonSchema.index({ 'metadata.tags': 1 });
lessonSchema.index({ 'stats.averageRating': -1 });

// Virtual for full name
lessonSchema.virtual('authorName').get(function() {
  return this.populated('author') ? `${this.author.profile.firstName} ${this.author.profile.lastName}`.trim() : 'Unknown';
});

// Method to increment view count
lessonSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  this.stats.lastAccessed = new Date();
  return this.save();
};

// Method to update rating
lessonSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.stats.averageRating * this.stats.totalRatings;
  this.stats.totalRatings += 1;
  this.stats.averageRating = (currentTotal + newRating) / this.stats.totalRatings;
  return this.save();
};

// Method to increment completion count
lessonSchema.methods.incrementCompletions = function() {
  this.stats.completions += 1;
  return this.save();
};

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;
