export default function FormButton(props) {
  return (
    <button
      type={props.type}
      onClick={props.onClick}
      className='w-full px-4 py-3 font-semibold leading-none text-gray-200 bg-teal-600 border-2 border-transparent sm:w-1/2 lg:w-2/5 xl:w-2/5 hover:text-teal-600 rounded-xl hover:border-teal-600 hover:bg-transparent focus:ring-teal-600 focus:ring-1'
    >
      {props.children}
    </button>
  );
}
