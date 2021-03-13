import ItineraryListItem from './ItineraryListItem';

export default function ItineraryList(props) {
  const parsedItineraries = props.itineraries.map((itinerary) => (
    <ItineraryListItem key={itinerary.id} itinerary={itinerary} />
  ));

  return (
    <section className='grid gap-4 m-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-flow-rows'>
      {parsedItineraries}
    </section>
  );
}