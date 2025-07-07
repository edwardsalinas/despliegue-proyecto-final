import { render, screen } from "@testing-library/react";
import { AppRouter } from "../../src/router/AppRouter";
import { useAuthStore } from "../../src/hooks";
import { MemoryRouter } from "react-router";
// import { CalendarPage } from "../../src/calendar";

jest.mock('../../src/hooks/useAuthStore');
jest.mock('../../src/calendar', () => ({
    CalendarPage: () => <h1>CalendarPage</h1>,
}))
describe("Pruebas en el <AppRouter />", () => {

    const mockCheckAuthToken = jest.fn();

    beforeEach( () => jest.clearAllMocks() );
    test("debe de mostrar la pantalla de carga y llamar checkAuthToken", () => {
        useAuthStore.mockReturnValue({
            status: 'checking',
            checkAuthToken: mockCheckAuthToken,
        })
        render(<AppRouter />);

        expect( screen.getByText('Cargando...')).toBeTruthy();
        expect( mockCheckAuthToken ).toHaveBeenCalled();
    });

    test('debe de mostrar el login en caso de no estar autenticado', () => {
        useAuthStore.mockReturnValue({
            status: 'not-authenticated',
            checkAuthToken: mockCheckAuthToken,
        })
        const { container } = render(
            <MemoryRouter initialEntries={['/auth2/test']}>
                <AppRouter />
            </MemoryRouter>
        )
        expect( screen.getByText('Ingreso') ).toBeTruthy();
        expect( container ).toMatchSnapshot();
    })

    test('debe de mostrar el calendario si estamso autenticados', () => {
         useAuthStore.mockReturnValue({
            status: 'authenticated',
            checkAuthToken: mockCheckAuthToken,
        })
        render(
            <MemoryRouter>
                <AppRouter />
            </MemoryRouter>
        )
        
        expect( screen.getByText('CalendarPage') ).toBeTruthy();

    })
});
