<!DOCTYPE html>
<html>
<head>
    <title>Password Reset</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .otp-code { 
            background: #4F46E5; 
            color: white; 
            padding: 15px; 
            font-size: 32px; 
            font-weight: bold; 
            text-align: center; 
            letter-spacing: 10px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            text-align: center; 
            font-size: 12px; 
            color: #666; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ config('app.name') }}</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{ $name }},</h2>
            
            <p>You requested to reset your password. Use the OTP code below to proceed:</p>
            
            <div class="otp-code">
                {{ $otp }}
            </div>
            
            <p>This OTP will expire in <strong>{{ $expiry }} minutes</strong>.</p>
            
            <p>If you didn't request this password reset, please ignore this email.</p>
            
            <p>Best regards,<br>{{ config('app.name') }} Team</p>
        </div>
        
        <div class="footer">
            <p>© {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>