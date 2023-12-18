import nodmailer from 'nodemailer';
import envconfig from '../config/envConfig.js';

const transporter = nodmailer.createTransport({
    host:envconfig.EMAIL_HOST,
    port:envconfig.EMAIL_PORT,
    secure:false,
    auth: {
        user:envconfig.EMAIL_USER,
        pass:envconfig.EMAIL_PASS,
    },
})

export default transporter;