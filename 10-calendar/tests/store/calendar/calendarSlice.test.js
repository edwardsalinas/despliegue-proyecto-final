import {
    calendarSlice,
    onAddNewEvent,
    onDeleteEvent,
    onLoadEvents,
    onLogoutCalendar,
    onSetActiveEvent,
    onUpdateEvent,
} from "../../../src/store/calendar/calendarSlice";
import {
    calendarWithActiveEventState,
    calendarWithEventsState,
    events,
    initialState,
} from "../../fixtures/calendarStates";

describe("Pruebas en calendarSlice", () => {
    test("debe de regresar el estado por defecto", () => {
        const state = calendarSlice.getInitialState();
        expect(state).toEqual(initialState);
    });

    test("onSetActiveEvent debe de activar el eventp", () => {
        const state = calendarSlice.reducer(
            calendarWithEventsState,
            onSetActiveEvent(events[0]),
        );
        expect(state.activeEvent).toEqual(events[0]);
    });

    test("onAddNewEvent debe de agregar el nuevo evento", () => {
        const newEvent = {
            id: "3",
            start: new Date("2020-11-09 13:00:00"),
            end: new Date("2020-11-09 15:00:00"),
            title: "Cumpleanos de Fernando!!",
            notes: "Alguna nota!!",
        };

        const state = calendarSlice.reducer( calendarWithEventsState, onAddNewEvent(newEvent) );
        expect( state.events ).toEqual([ ...events, newEvent ]);        
    });

    test("onUpdate Event debe de agregar el nuevo evento", () => {
        const updatedEvent = {
            id: "1",
            start: new Date("2020-10-21 13:00:00"),
            end: new Date("2020-10-21 15:00:00"),
            title: "Cumpleanos de Fernando Actualizado",
            notes: "Alguna nota actualizada",
        };

        const state = calendarSlice.reducer( calendarWithEventsState, onUpdateEvent( updatedEvent ) );
        // expect( state.events ).toEqual([ ...events, updatedEvent ]);        
        expect( state.events ).toContain( updatedEvent);        
    });

    test('onDeleteEvent debe de borrar el evento activo', () => {
        const state = calendarSlice.reducer( calendarWithActiveEventState, onDeleteEvent() )
        expect( state.activeEvent ).toBeNull();
        expect( state.events ).not.toContain( events[0] );
    });

    test('onLoadEvent debe de establecer los eventos', () => {
        const state = calendarSlice.reducer( initialState, onLoadEvents( events ) );
        expect(state.events.length).toBeGreaterThan(0);
        expect(state.events).toEqual( events );
        expect( state.isLoadingEvents ).toBeFalsy();
        
        calendarSlice.reducer( state, onLoadEvents( events ) );
        expect( state.events.length ).toBe( events.length );
    });

    test('onLogoutCalendar debe de limpiar el estado', () => {
        const state = calendarSlice.reducer( calendarWithActiveEventState, onLogoutCalendar() );
        expect(state).toEqual(initialState);
    });
});
