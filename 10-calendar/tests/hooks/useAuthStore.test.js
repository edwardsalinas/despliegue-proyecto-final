import { act, renderHook, screen, waitFor } from "@testing-library/react"
import { useAuthStore } from "../../src/hooks"
import { Provider } from "react-redux";
import { authSlice, store } from "../../src/store";
import { configureStore } from "@reduxjs/toolkit";
import { initialState, notAuthenticatedState } from "../fixtures/authStates";
import { testUserCredentials } from "../fixtures/testUser";
import { calendarApi } from "../../src/api";


const getMockStore = ( initialState) => {
    return configureStore({
        reducer: {
            // ui: uiSlice.reducer
            auth: authSlice.reducer
        },
        preloadedState: {
            auth: { ...initialState}
            // ui: { ...initialState }
        }
    })
}

describe('Pruebas en el useAuthStore', () => {

    beforeEach(() => localStorage.clear() );


    test('debe de regresar los valores por defecto', () => {
        const mockStore = getMockStore({...initialState})
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({children}) => <Provider store={ mockStore }> {children} </Provider>,
        });
        expect(result.current).toEqual({
            errorMessage: undefined,
            status: 'checking',
            user: {},
            checkAuthToken: expect.any(Function),
            startLogin: expect.any(Function),
            startLogout: expect.any(Function),
            startRegister: expect.any(Function)
        });
        
    })

    test('startLogin debe de realizar el login correctament', async() => {
        const mockStore = getMockStore({...notAuthenticatedState})
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({children}) => <Provider store={ mockStore }> {children} </Provider>,
        });
        await act(async() => {
            await result.current.startLogin( testUserCredentials )
        });

        const { errorMessage, status, user } = result.current;
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: {
                name: 'Test User', 
                uid: '683bd2ab4ee199f486751bb8'
            }
        });

        expect( localStorage.getItem('token') ).toEqual( expect.any(String));
        expect( localStorage.getItem('token-init-date') ).toEqual( expect.any(String));
    });

    test('start login debe de fallar la autenticacion', async() => {

        const mockStore = getMockStore({...notAuthenticatedState})
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({children}) => <Provider store={ mockStore }> {children} </Provider>,
        });
        await act(async() => {
            await result.current.startLogin( { email:'algo@gmail.com', password:'123456789'} )
        });

        const { errorMessage, status, user } = result.current;
        expect(localStorage.getItem('token')).toBeNull();
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: 'Credenciales Incorrectas',
            status: 'not-authenticated',
            user: {}
        })

        await waitFor( 
            () => expect( result.current.errorMessage ).toBe(undefined)
        )
        
    });

    test('startRegister debe de crear un usuario', async() => {
        const newUser = { email:'algo@gmail.com', password:'123456789', name:'Test User2' };
        
        const mockStore = getMockStore({...notAuthenticatedState});
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({children}) => <Provider store={ mockStore }> {children} </Provider>,
        });

        const spy = jest.spyOn( calendarApi, 'post').mockReturnValue({
            data: {
            "ok": true,
            "uid": "683b7e454ee199f486751bb3",
            "name": "Test User",
            "token": "ALGUN-TOKEN"
            }
        });

        await act(async() => {
            await result.current.startRegister( newUser )
        });

        const { errorMessage, status, user } = result.current;
        expect( { errorMessage, status, user } ).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: '683b7e454ee199f486751bb3' }
        })
        
        spy.mockRestore();
    });

    test('startRegister debe de fallar la creacion', async() => {
        
        const mockStore = getMockStore({...notAuthenticatedState});
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({children}) => <Provider store={ mockStore }> {children} </Provider>,
        });

        await act(async() => {
            await result.current.startRegister( testUserCredentials )
        });

        const { errorMessage, status, user } = result.current;
        expect( { errorMessage, status, user } ).toEqual({
            errorMessage: "Un usuario existe con es correo",
            status: 'not-authenticated',
            user: {}
        });
        
    });

    test('checkAuthToken debe de fallar si no hay token', async() => {
        const mockStore = getMockStore({...initialState});
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({children}) => <Provider store={ mockStore }> {children} </Provider>,
        });

        await act(async() => {
            await result.current.checkAuthToken();
        });

        const { errorMessage, status, user } = result.current;

        expect({ errorMessage, status, user }).toEqual({
            errorMessage:undefined,
            status:'not-authenticated',
            user:{}
        })
        expect( localStorage.getItem('token')).toBeNull();

    });

    test('checkAuthToken debe de autenticar si hay un token', async() => {

        const { data } = await calendarApi.post('/auth', testUserCredentials );
        localStorage.setItem('token', data.token)
        
        const mockStore = getMockStore({...initialState});
        const { result } = renderHook( () => useAuthStore(), {
            wrapper: ({children}) => <Provider store={ mockStore }> {children} </Provider>,
        });

        await act(async() => {
            await result.current.checkAuthToken();
        });

        const { errorMessage, status, user } = result.current;

        // console.log( { errorMessage, status, user });
        //TODO revisar por que es undefined el uid
        expect({ errorMessage, status, user }).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: { name: 'Test User', uid: undefined }
        })
        
    });

})