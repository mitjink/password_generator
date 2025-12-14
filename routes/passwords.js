const express = require('express');
const router = express.Router();

function generatePassword(length = 12, useUppercase = true, useNumbers = true, useSymbols = true) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = `~!?@#$%^&*_-+()[]{}></\\|"'.,:;`;
    
    let chars = lowercase;
    if (useUppercase) chars += uppercase;
    if (useNumbers) chars += numbers;
    if (useSymbols) chars += symbols;
    
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    
    return password;
}

const requestLogger = (req, res, next) => {
    const time = new Date().toLocaleTimeString();
    const method = req.method;
    const url = req.originalUrl;
    
    console.log(`[${time}] ${method} ${url}`);
    
    if (Object.keys(req.query).length > 0) {
        console.log('   Query params:', req.query);
    }
    
    next();
};

router.use(requestLogger);

router.get('/', (req, res) => {
    try {
        const length = parseInt(req.query.length) || 12;
        const uppercase = req.query.uppercase !== 'false';
        const numbers = req.query.numbers !== 'false';
        const symbols = req.query.symbols !== 'false';
        
        const password = generatePassword(length, uppercase, numbers, symbols);
        
        const response = {
            success: true,
            password: password,
            length: length,
            settings: {
                uppercase: uppercase,
                numbers: numbers,
                symbols: symbols
            },
            timestamp: new Date().toISOString()
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Ошибка при обработке GET запроса:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            message: error.message
        });
    }
});

router.post('/', (req, res) => {
    try {
        const { 
            length = 12, 
            uppercase = true, 
            numbers = true, 
            symbols = true 
        } = req.body;
        
        const lengthNum = parseInt(length);
        if (isNaN(lengthNum) || lengthNum < 4 || lengthNum > 64) {
            return res.status(400).json({
                error: 'Длина пароля должна быть числом от 4 до 64 символов',
                received: length
            });
        }

        const uppercaseBool = typeof uppercase === 'string' ? uppercase !== 'false' : Boolean(uppercase);
        
        const numbersBool = typeof numbers === 'string' ? numbers !== 'false' : Boolean(numbers);
            
        const symbolsBool = typeof symbols === 'string' ? symbols !== 'false' : Boolean(symbols);
        
        const password = generatePassword(lengthNum, uppercaseBool, numbersBool, symbolsBool);
        
        const response = {
            success: true,
            password: password,
            length: lengthNum,
            settings: {
                uppercase: uppercaseBool,
                numbers: numbersBool,
                symbols: symbolsBool
            },
            requestBody: req.body, 
            timestamp: new Date().toISOString(),
            message: 'Пароль сгенерирован через POST запрос'
        };
        
        res.json(response);
        
    } catch (error) {
        console.error('Ошибка при обработке POST запроса:', error);
        res.status(500).json({
            error: 'Внутренняя ошибка сервера',
            message: error.message
        });
    }
});

router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Password Generator API',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = router;