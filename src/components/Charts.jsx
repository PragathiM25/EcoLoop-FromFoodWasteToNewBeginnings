import { TrendingUp, Package, Clock, CheckCircle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";

const COLORS = ["#2d6b2d", "#34a472", "#52bb88", "#82d3a8", "#c2a366", "#d0b885"];

export function StatusPieChart({ data, title }) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-forest-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={50}
            paddingAngle={2}
          >
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #ede2cc",
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBarChart({ data, title }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-forest-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ede2cc" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#245524" }} />
          <YAxis tick={{ fontSize: 12, fill: "#245524" }} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #ede2cc",
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
            }}
          />
          <Bar dataKey="value" fill="#34a472" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TimelineAreaChart({ data, title, dataKey = "count" }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-forest-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34a472" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#34a472" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ede2cc" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#245524" }} />
          <YAxis tick={{ fontSize: 12, fill: "#245524" }} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #ede2cc",
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
            }}
          />
          <Area type="monotone" dataKey={dataKey} stroke="#2d6b2d" strokeWidth={2} fill="url(#colorArea)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
