import { RateLimitData } from "lib/twitter/RateLimitRedisPlugin";
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
  TooltipItem,
  ChartDataset,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { useSession } from "next-auth/react";
import styled from "styled-components";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "lib/nextAuth";
import { RateLimitResponse } from "./api/admin/rate-limit";
import { darkTheme } from "src/themes";
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
  padding: 64px;

  background-color: ${darkTheme.color.surface};
  color: ${darkTheme.color.onSurface};
`;

interface IModel {
  x: number;
  y: number;
  label: string;
}

function dataToChart(t: RateLimitData): IModel[] {
  return t?.map((t) => ({
    x: t.time,
    y: t.remaining / t.limit,
    label: `${t.remaining}/${t.limit}`,
  }));
}

function CustomLineChart(props: {
  title: string;
  datasets: ChartDataset<"line", IModel[]>[];
}) {
  return (
    <Line
      title={props.title}
      style={{ padding: "64px", color: "white" }}
      options={{
        scales: {
          x: {
            type: "time",
            time: {
              unit: "month",
            },

            grid: {
              color: "white",
              borderColor: "white",
            },
          },
          y: {
            suggestedMin: 0,
            grid: {
              color: "white",
              borderColor: "white",
            },
            ticks: {
              callback: (val) => (val as number) * 100 + "%",
              color: "white",
            },
          },
        },
        plugins: {
          title: {
            display: true,
            text: props.title,
            color: "white",
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem: TooltipItem<"line">) {
                return (tooltipItem.raw as IModel).label + "";
              },
            },
          },
        },
      }}
      data={{
        datasets: props.datasets,
      }}
    />
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Record<string, never>>> {
  const session = await getServerSession(context, authOptions);

  if (!session || session.user.id !== process.env.ADMIN_ID) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  return { props: {} };
}

export default function Admin() {
  const session = useSession();

  const [rateLimitData, setRateLimitData] = useState<RateLimitResponse>({
    lookups: [],
    likes: {},
    homeTimeline: {},
  });

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

      <h2>User Rate Limits</h2>
      <CustomLineChart
        title="Feed"
        datasets={Object.entries(rateLimitData.homeTimeline).map(
          ([id, rateLimit]) => ({
            label: "User:" + id,
            fill: false,
            data: dataToChart(rateLimit),
            borderColor: "blue",
            backgroundColor: "blue",
          })
        )}
      />
      <CustomLineChart
        title="Likes"
        datasets={Object.entries(rateLimitData.likes).map(
          ([id, rateLimit]) => ({
            label: "User:" + id,
            fill: false,
            data: dataToChart(rateLimit),
            borderColor: "red",
            backgroundColor: "red",
          })
        )}
      />

      <h2>App Rate Limits</h2>
      <CustomLineChart
        title="App Rate Limits"
        datasets={[
          {
            label: "Tweet Lookups",
            fill: false,
            data: dataToChart(rateLimitData.lookups),
            borderColor: "yellow",
            backgroundColor: "yellow",
          },
        ]}
      />
    </Main>
  );
}
