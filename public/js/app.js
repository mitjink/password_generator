document.addEventListener('DOMContentLoaded', function() {

    const elements = {
        lengthSlider: document.getElementById('length'),
        lengthValue: document.getElementById('lengthValue'),
        uppercaseCheckbox: document.getElementById('uppercase'),
        numbersCheckbox: document.getElementById('numbers'),
        symbolsCheckbox: document.getElementById('symbols'),
        passwordResult: document.getElementById('passwordResult'),
        generateBtn: document.getElementById('generateBtn'),
        copyBtn: document.getElementById('copyBtn'),
        testGetBtn: document.getElementById('testGetBtn'),
        testPostBtn: document.getElementById('testPostBtn'),
        messageDiv: document.getElementById('message')
    };

    elements.lengthSlider.addEventListener('input', function() {
        elements.lengthValue.textContent = this.value;
    });

    async function generatePassword() {
        const params = new URLSearchParams({
            length: elements.lengthSlider.value,
            uppercase: elements.uppercaseCheckbox.checked,
            numbers: elements.numbersCheckbox.checked,
            symbols: elements.symbolsCheckbox.checked
        });

        try {
            showLoading();
            const response = await fetch(`/api/passwords?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.password) {
                elements.passwordResult.textContent = data.password;
                showMessage('Пароль успешно сгенерирован.', 'success');
            } else if (data.error) {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showMessage(`Ошибка: ${error.message}`, 'error');
        }
    }

    async function copyPassword() {
        const password = elements.passwordResult.textContent;
        
        if (!password || password === 'Нажмите "Сгенерировать"') {
            showMessage('Сначала сгенерируйте пароль', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(password);
            showMessage('Пароль скопирован в буфер обмена.', 'success');
            
            elements.copyBtn.innerHTML = 'Скопировано.';
            setTimeout(() => {
                elements.copyBtn.innerHTML = 'Скопировать';
            }, 2000);
            
        } catch (error) {
            console.error('Ошибка копирования:', error);
            showMessage('Не удалось скопировать пароль', 'error');
        }
    }

    async function testGetRequest() {
        try {
            const response1 = await fetch('/api/passwords?length=8&symbols=false');
            const data1 = await response1.json();
            console.log('GET тест 1 (8 символов, без спецсимволов):', data1);
            
            const response2 = await fetch('/api/passwords?length=20');
            const data2 = await response2.json();
            console.log('GET тест 2 (20 символов):', data2);
            
            const response3 = await fetch('/api/passwords?length=15&numbers=false&symbols=false');
            const data3 = await response3.json();
            console.log('GET тест 3 (15 символов,только буквы):', data3);
            
            showMessage('Все GET тесты выполнены успешно. Проверьте консоль браузера.', 'success');
            
        } catch (error) {
            console.error('Ошибка тестирования GET:', error);
            showMessage(`Ошибка тестирования GET: ${error.message}`, 'error');
        }
    }

    async function testPostRequest() {
        try {
            const testData = {
                length: 16,
                uppercase: true,
                numbers: true,
                symbols: false,
                test: true 
            };

            const response = await fetch('/api/passwords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ошибка: ${response.status}`);
            }

            const data = await response.json();
            console.log('POST ответ:', data);
            
            elements.passwordResult.textContent = data.password;
            showMessage(`POST запрос выполнен. Длина: ${data.settings?.length || '?'}`, 'success');
            
        } catch (error) {
            console.error('Ошибка POST запроса:', error);
            showMessage(`Ошибка POST: ${error.message}`, 'error');
        }
    }

    function showMessage(text, type) {
        elements.messageDiv.textContent = text;
        elements.messageDiv.className = `message ${type}`;
        elements.messageDiv.style.display = 'block';

        setTimeout(() => {
            elements.messageDiv.style.display = 'none';
        }, 4000);
    }

    function showLoading() {
        elements.passwordResult.textContent = 'Генерация...';
        elements.passwordResult.style.color = '#718096';
    }

    elements.generateBtn.addEventListener('click', generatePassword);
    elements.copyBtn.addEventListener('click', copyPassword);
    elements.testGetBtn.addEventListener('click', testGetRequest);
    elements.testPostBtn.addEventListener('click', testPostRequest);

    generatePassword();

    elements.generateBtn.innerHTML = 'Сгенерировать';
    elements.copyBtn.innerHTML = 'Скопировать';
    elements.testGetBtn.innerHTML = 'Тест GET';
    elements.testPostBtn.innerHTML = 'Тест POST';
});