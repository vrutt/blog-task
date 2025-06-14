const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());

app.use('/auth', require('./routes/authRouter'));
app.use('/article', require('./routes/articlerouter'));

app.listen(3001, () => console.log('Server running on port http://localhost:3001'));