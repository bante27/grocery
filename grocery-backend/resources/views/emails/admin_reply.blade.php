<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Admin Reply</title>
</head>
<body>
    <p>Hello {{ $name }},</p>

    <p>Thank you for contacting us. Here is our reply:</p>

    <blockquote style="border-left:4px solid #ccc;padding-left:10px;">
        {{ $reply }}
    </blockquote>

    <p>Best regards,<br>
    Grocery Store Support Team</p>
</body>
</html>
