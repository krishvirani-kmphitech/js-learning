import mongoose, { Schema, model } from "mongoose";

const taskSchema = new Schema({

    shiftId: {
        type: Schema.Types.ObjectId,
        ref: "Shift",
        required: true
    },
    taskName: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true,
        validate: {
            validator : function(endTime) {
                if(endTime < this.startTime) {
                    return false;
                }
            },
            message: "we need end time greater then start time"
        }
    },
    subTask: [
        {
            subTaskName: {
                type: String,
                required: true
            },
            subTaskStatus: {
                type: String,
                enum: ["pending", "complated"],
                default: "pending"
            }
        }
    ],
    mainTaskStatus: {
        type: String,
        enum: ["pending", "complated"],
        default: "pending"
    }

});

taskSchema.pre("save", function (next) {

    const isAllComplate = this.subTask.filter(subT => subT.subTaskStatus == "pending");

    if (isAllComplate.length == 0) {
        this.mainTaskStatus = "complated"
    }

    next()
});

const Task = model("Task", taskSchema);
export default Task;