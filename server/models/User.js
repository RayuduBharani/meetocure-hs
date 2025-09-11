import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    hospitalName: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    hospitalImage: { type: String },
    docters : {
        type : Array,
        default : []
    }
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('HospitalLogins', UserSchema);