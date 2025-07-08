import calendarApi from '../../src/api/calendarApi';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(calendarApi);

describe('Pruebas en el calendar Api', () => {

    beforeEach(() => {
        mock.reset();
    });

    test('debe de tener la configuración por defecto', () => {
        // Comprobamos que la URL base esté configurada correctamente
        expect(calendarApi.defaults.baseURL).toBe(process.env.VITE_API_URL);
    });

    test('debe de tener el x-token en el header de todas las peticiones', async () => {
        const token = 'ABC-123-XYZ';
        localStorage.setItem('token', token);

        // Mockear la respuesta para la petición GET a /auth
        mock.onGet('/auth').reply(200, { ok: true });

        // Hacemos una llamada de prueba
        const res = await calendarApi.get('/auth');

        // Verificamos que el interceptor añadió el header correctamente
        expect(res.config.headers['x-token']).toBe(token);
    });
});
