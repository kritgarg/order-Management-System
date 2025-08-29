import { Badge } from "@/components/ui/badge";

export const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "Pending":
        return {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        };
      case "casting":
        return {
          label: "Casting",
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        };
      case "annealing":
        return {
          label: "Annealing",
          className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
        };
      case "machining":
        return {
          label: "Machining",
          className: "bg-pink-100 text-pink-800 hover:bg-pink-200",
        };
      case "bearing/wobler":
        return {
          label: "Bearing/Wobler",
          className: "bg-yellow-100 text-black-800 hover:bg-yellow-200",
        };
      case "dispached":
        return {
          label: "Dispached",
          className: "bg-green-100 text-green-800 hover:bg-green-200",
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        };
    }
  };

  const { label, className } = getStatusConfig(status);

  return <Badge className={className}>{label}</Badge>;
};
