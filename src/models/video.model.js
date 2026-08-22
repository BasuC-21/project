import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const quizQuestionSchema = new Schema(
    {
        question: {
            type: String,
            required: true
        },
        options: {
            type: [String],
            required: true,
            validate: {
                validator: function (value) {
                    return value.length === 4;
                },
                message:
                    "Each quiz question must have exactly 4 options"
            }
        },
        correctAnswer: {
            type: String,
            required: true
        }
    },
    {
        _id: false
    }
);

const videoSchema = new Schema(
    {
        videoFile: {
            type: String,
            required: true
        },

        thumbnail: {
            type: String,
            required: true
        },

        title: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },

        duration: {
            type: Number,
            required: true
        },

        views: {
            type: Number,
            default: 0
        },

        isPublished: {
            type: Boolean,
            default: true
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        quiz: {
            type: [quizQuestionSchema],
            default: []
        },
        transcript: {
    type: String,
    default: ""
},

quizGeneratedFromTranscript: {
    type: Boolean,
    default: false
}
    },
    {
        timestamps: true
    }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model(
    "Video",
    videoSchema
);