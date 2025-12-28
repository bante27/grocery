<!DOCTYPE html>
<html>
<head>
    <title>Admin Reply</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h1>Grocery Store Reply</h1>
        </div>
        
        <div style="padding: 20px;">
            <p>Hello <strong>{{ $userName }}</strong>,</p>
            
            <p>Thank you for contacting us. Here is our response to your message:</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0;">
                {{ $adminReply }}
            </div>
            
            <p><strong>Reply sent on:</strong> {{ $replyDate }}</p>
            
            <p>If you need further assistance, please contact us again.</p>
            
            <p>Best regards,<br>
            <strong>Grocery Store Admin Team</strong></p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px; padding: 20px; border-top: 1px solid #e5e7eb;">
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>