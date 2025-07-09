import { Calendar, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
// import 'react-big-calendar/lib/addons/dragAndDrop/styles';


import { CalendarEvent, CalendarModal, FabAddNew, FabDelete, Navbar } from "../";
import { getMessagesES, localizer } from "../../helpers";
import { useEffect, useState } from "react";
import { useUiStore, useCalendarStore, useAuthStore } from "../../hooks";


export const CalendarPage = () => {

  const { user } = useAuthStore();
  const { openDateModal } = useUiStore();
  const { events, setActiveEvent, startLoadingEvents } = useCalendarStore();

  const [lastView] = useState(
    localStorage.getItem("lastView") || "week",
  );

  const eventStyleGetter = (event) => {
    // console.log({event, start, end, isSelected});

    const isMyEvent = ( user.uid === event.user.id ) || ( user.uid === event.user.uid );
    const style = {
      backgroundColor: isMyEvent ? "#347CF7" : "#465660",
      borderRadius: "0px",
      opacity: 0.8,
      color: "white",
    };

    return {
      style,
    };
  };

  const [currentView, setCurrentView] = useState(lastView || Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());

  const onDoubleClick = () => {
    // console.log({ doubleClick: event });
    openDateModal();
  };

  const onSelect = (event) => {
    // console.log({ click: event });
    setActiveEvent(event);
  };

  const onViewChanged = (event) => {
    console.log({ viewChanged: event });
    setCurrentView(event);
    localStorage.setItem("lastView", event);
  };

  useEffect(() => {
    startLoadingEvents()
  }, [startLoadingEvents])
  
  return (
    <>
      <Navbar />
      <Calendar
        culture="es"
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        view={currentView}
        defaultView={lastView}
        // onView={ setCurrentView }
        onNavigate={setCurrentDate}
        style={{ height: "calc(100vh - 80px)" }}
        messages={getMessagesES()}
        eventPropGetter={eventStyleGetter}
        components={{
          event: CalendarEvent,
        }}
        onDoubleClickEvent={onDoubleClick}
        onSelectEvent={onSelect}
        onView={onViewChanged}
      />

      <CalendarModal />
      <FabAddNew />
      <FabDelete />
    </>
  );
};
