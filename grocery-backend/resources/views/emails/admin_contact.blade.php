<h3>New Contact Message</h3>

<p><strong>Name:</strong> {{ $data->name }}</p>
<p><strong>Email:</strong> {{ $data->email }}</p>
<p><strong>Phone:</strong> {{ $data->phone ?? 'N/A' }}</p>
<p><strong>Subject:</strong> {{ $data->subject }}</p>

<p><strong>Message:</strong></p>
<p>{{ $data->message }}</p>
