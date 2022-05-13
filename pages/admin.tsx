import { RateLimitData } from "lib/twitter";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Chart as ChartJS,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { useSession } from "next-auth/react";
import styled from "styled-components";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const Main = styled.div`
  padding: 16px;
`;

interface IData {
  lookup?: RateLimitData;
  likes?: RateLimitData;
}

interface IModel {
  x: number;
  y: number;
  label: string;
}

export default function Admin() {
  const session = useSession();

  const [rateLimitData, setRateLimitData] = useState<IData>({});

  useEffect(() => {
    if (session.status === "authenticated") {
      fetch("/api/admin/rate-limit")
        .then((res) => res.json())
        .then((data) => setRateLimitData((s) => ({ ...s, ...data })))
        .catch(alert);
    }
  }, [session.status]);

  return (
    <Main>
      <h1>Admin Dashboard</h1>
      <h2>Rate Limits</h2>
      <Line
        style={{ padding: "64px" }}
        options={{
          scales: {
            x: {
              type: "time",
              time: {
                unit: "month",
              },
            },
            y: { suggestedMin: 0 },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return (tooltipItem.raw as IModel).label + "";
                },
              },
            },
          },
        }}
        data={{
          datasets: [
            {
              label: "Tweet Lookups",
              fill: false,
              data: rateLimitData.lookup?.map((t) => ({
                x: t.time,
                y: t.remaining,
                label: `${t.remaining}/${t.limit}`,
              })),
            },
            {
              label: "Tweet Likes",
              fill: false,
              data: rateLimitData.likes?.map((t) => ({
                x: t.time,
                y: t.remaining / t.limit,
                label: `${t.remaining}/${t.limit}`,
              })),
              borderColor: "pink",
              backgroundColor: "red",
            },
          ],
        }}
      />
    </Main>
  );
}
