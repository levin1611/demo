(
    async function(params) {
        // let host = window.location;
        window.CUSTOM_ENV = '';
        window.CUSTOM_ENV_CONFIG = {};
        try {
            const xhr = new XMLHttpRequest();
            // xhr.timeout = 4000
            xhr.ontimeout = () => { };
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                        const res = JSON.parse(xhr.responseText);
                        window.CUSTOM_ENV = 'exist';
                        window.CUSTOM_ENV_CONFIG = res.data;
                    }
                }
            };
            xhr.open('get', 'http://localhost:3000/users', false);
            xhr.send();
        } catch (error) {
            console.error(error);
        }
    }
)(window);
