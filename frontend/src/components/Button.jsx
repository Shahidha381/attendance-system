const Button = ({ children, variant = "primary", onClick }) => {
  const base =
    "px-5 py-2 rounded-lg font-medium transition duration-200";

  const styles = {
    primary:
      "bg-black text-white border border-gray-800 hover:bg-gray-900",

    secondary:
      "bg-gray-900 text-gray-200 border border-gray-700 hover:bg-gray-800 hover:text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  );
};

export default Button;