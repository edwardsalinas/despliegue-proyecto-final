import { useDispatch, useSelector } from "react-redux"
import { calendarApi } from "../api";
import { onChecking, onLogin, onLogout, onLogoutCalendar } from "../store";



export const useAuthStore = () => {
    const { status, user, errorMessage } = useSelector( state => state.auth );
    const dispatch = useDispatch();

    const startLogin = async({ email, password }) => {
        
        dispatch( onChecking() );
        
        try {
            const {data} = await calendarApi.post('/auth', { email, password });
            localStorage.setItem('token', data.token );
            localStorage.setItem('token-init-date', new Date().getTime() );
            
            dispatch( onLogin({ name: data.name, uid: data.uid }) );

        } catch {

            dispatch( onLogout('Credenciales Incorrectas') );
        }
    }

    const startRegister = async({ name, email, password}) => {
        dispatch( onChecking() );
        try {
            
            const {data} = await calendarApi.post('/auth/new', { name, email, password });
            localStorage.setItem('token', data.token );
            localStorage.setItem('token-init-date', new Date().getTime() );
            
            dispatch( onLogin({ name: data.name, uid: data.uid }) );
            


        } catch (error) {
        
            dispatch( onLogout(error.response.data?.msg || '---'))
        }
    }

    const checkAuthToken = async() => {
        const token = localStorage.getItem('token');
        if (!token) return dispatch( onLogout() );

        try {
            const {data} = await calendarApi.get('/auth/renew');
            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime() );
            dispatch( onLogin({ name: data.name, uid: data.uid }) );
        } catch {
            localStorage.clear();
            dispatch( onLogout() );
        }
    }

    const startLogout = () => {
        localStorage.clear();
        dispatch( onLogoutCalendar() );
        dispatch( onLogout() );
    }

    return {
        //*propiedades
        errorMessage,
        status,
        user,

        //*Metodos
        checkAuthToken,
        startLogin,
        startLogout,
        startRegister,
    }
}