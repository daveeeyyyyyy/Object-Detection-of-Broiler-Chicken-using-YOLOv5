import { Separator } from "../ui/separator";

export type AnalyticCardData = {
  title: String;
  value: number;
};

const AnalyticalCard = (prop: AnalyticCardData) => {
  return (
    <div className="border rounded-lg">
      <div className="p-4 text-3xl font-abel">
        {prop.value.toLocaleString()}
      </div>
      <Separator />
      <div className="px-4 py-2 text-sm text-slate-600">{prop.title}</div>
    </div>
  );
};

export default AnalyticalCard;
