<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Thank You!</title>
</head>
<body>
    <h2>Hi {{ $data['name'] }},</h2>
    <p>Thank you for reaching out to us!</p>
    <p>We have received your message and will get back to you as soon as possible.</p>
    <p><strong>Your Message:</strong></p>
    <blockquote>{{ $data['message'] }}</blockquote>
    <p>Best regards,<br>Your Company Name</p>
</body>
</html>
