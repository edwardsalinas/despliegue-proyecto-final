import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux'; // Importación añadida
import { useAuthStore } from '../../src/hooks/useAuthStore';
import { authSlice } from '../../src/store';
import { initialState } from '../fixtures/authStates';
import { testUserCredentials } from '../fixtures/testUser';
import calendarApi from '../../src/api/calendarApi';
import MockAdapter from 'axios-mock-adapter';

// Crear una instancia del mock de Axios
const mock = new MockAdapter(calendarApi);

describe('Pruebas en el useAuthStore', () => {

    beforeEach(() => {
        // Limpiar los mocks antes de cada prueba
        mock.reset();
        localStorage.clear();
    });

    const getStore = (state) => {
        return configureStore({
            reducer: {
                auth: authSlice.reducer
            },
            preloadedState: { auth: state }
        });
    }

    test('debe de regresar el estado por defecto', () => {
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={getStore(initialState)}>{children}</Provider>
        });
        expect(result.current).toEqual({ ...initialState, startLogin: expect.any(Function), startRegister: expect.any(Function), checkAuthToken: expect.any(Function), startLogout: expect.any(Function) });
    });

    test('startLogin debe de realizar el login correctamente', async () => {
        const { result } = renderHook(() => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={getStore(initialState)}>{children}</Provider>
        });

        // Configurar el mock para la petición de login
        mock.onPost('/auth').reply(200, {
            ok: true,
            uid: '683bd2ab4ee199f486751bb8',
            name: 'Test User',
            token: 'TEST-TOKEN'
        });

        await act(async() => {
            await result.current.startLogin(testUserCredentials);
        });

        const { errorMessage, status, user } = result.current;
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: '683bd2ab4ee199f486751bb8' }
        });

        // Esperar a que el token se guarde en localStorage
        await waitFor(() => expect(localStorage.getItem('token')).toBe('TEST-TOKEN'));
    });

    test('startLogin debe de fallar la autenticación', async() => {
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={getStore(initialState)}>{ children }</Provider>
        });

        // Configurar el mock para que falle
        mock.onPost('/auth').reply(400, { ok: false, msg: 'Credenciales no válidas' });

        await act(async() => {
            await result.current.startLogin(testUserCredentials);
        });
        
        await waitFor(() => expect(result.current.errorMessage).toBe('Credenciales Incorrectas'));
        
        const { status, errorMessage } = result.current;
        expect(status).toBe('not-authenticated');
        expect(errorMessage).toBe('Credenciales Incorrectas');
    });


    test('startRegister debe de crear un usuario', async() => {

        const newUser = { email: 'test2@google.com', password: 'testpassword123', name: 'Test User 2' };
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={getStore(initialState)}>{ children }</Provider>
        });

        // Configurar el mock para el registro
        mock.onPost('/auth/new').reply(201, {
            ok: true,
            uid: 'some-uid',
            name: newUser.name,
            token: 'SOME-TEST-TOKEN'
        });

        await act(async() => {
            await result.current.startRegister(newUser);
        });

        await waitFor(() => expect(result.current.status).toBe('authenticated'));

        const { status, user, errorMessage } = result.current;
        expect({status, errorMessage}).toEqual({
            status: 'authenticated',
            errorMessage: undefined,
        });
        expect(user.name).toBe(newUser.name);
    });


    test('startRegister debe de fallar la creación', async() => {
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={getStore(initialState)}>{ children }</Provider>
        });

        // Configurar el mock para que falle el registro
        mock.onPost('/auth/new').reply(400, { ok: false, msg: 'El usuario ya existe' });

        await act(async() => {
            await result.current.startRegister(testUserCredentials);
        });

        await waitFor(() => expect(result.current.errorMessage).toBe('El usuario ya existe'));

        const { status, errorMessage } = result.current;
        expect(status).toBe('not-authenticated');
        expect(errorMessage).toBe('El usuario ya existe');
    });


    test('checkAuthToken debe de fallar si no hay token', async() => {
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={getStore(initialState)}>{ children }</Provider>
        });

        await act(async() => {
            await result.current.checkAuthToken();
        });

        const { status } = result.current;
        expect(status).toBe('not-authenticated');
    });


    test('checkAuthToken debe de autenticar con token', async() => {
        localStorage.setItem('token', 'SOME-TEST-TOKEN');

        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({ children }) => <Provider store={getStore(initialState)}>{ children }</Provider>
        });

        // Configurar el mock para la renovación del token
        mock.onGet('/auth/renew').reply(200, {
            ok: true,
            uid: 'some-uid',
            name: 'Test User',
            token: 'ANOTHER-TEST-TOKEN'
        });

        await act(async() => {
            await result.current.checkAuthToken();
        });

        const { status } = result.current;
        expect(status).toBe('authenticated');
    });
});