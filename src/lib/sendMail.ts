import nodemailer from "nodemailer"

interface MailSenderProps{
    email: string,
    title: string,
    body: React.ReactNode,
}

export default async function mailSender({email, title, body}: MailSenderProps){
    try{
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized: false,
            },
            port: 587,
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            secure: false,
        })

        let info = await transporter.sendMail({
            from: `SnapBook || By Virender ${process.env.MAIL_USER}`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,   
        })

        console.log("Node Main Info ->>  ",info);
        return info;
    }
    catch(error : any){
        console.log("Error In Mail Sending", error);
        return error.message
    }
}
