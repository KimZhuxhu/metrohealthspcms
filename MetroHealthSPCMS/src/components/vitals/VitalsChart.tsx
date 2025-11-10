import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { VitalSign } from '@/types';
import { format } from 'date-fns';

interface VitalsChartProps {
  data: VitalSign[];
  vitalType: 'heartRate' | 'bloodPressure' | 'temperature' | 'spO2' | 'respiratoryRate';
  title: string;
  unit: string;
  normalRange?: { min: number; max: number };
}

type TimeRange = '1h' | '6h' | '12h' | '24h';

export function VitalsChart({ data, vitalType, title, unit, normalRange }: VitalsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  const timeRangeHours = {
    '1h': 1,
    '6h': 6,
    '12h': 12,
    '24h': 24,
  };

  const filterDataByTimeRange = () => {
    const now = new Date();
    const hoursAgo = timeRangeHours[timeRange];
    const cutoffTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    return data
      .filter((reading) => new Date(reading.timestamp) >= cutoffTime)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const filteredData = filterDataByTimeRange();

  const chartData = filteredData.map((reading) => {
    const item: any = {
      timestamp: format(new Date(reading.timestamp), 'HH:mm'),
      fullTimestamp: reading.timestamp,
    };

    if (vitalType === 'bloodPressure') {
      item.systolic = reading.systolicBP;
      item.diastolic = reading.diastolicBP;
    } else {
      item.value = reading[vitalType];
    }

    return item;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold mb-2">
          {format(new Date(data.fullTimestamp), 'MMM dd, HH:mm')}
        </p>
        {vitalType === 'bloodPressure' ? (
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-blue-600">Systolic:</span> {data.systolic} {unit}
            </p>
            <p className="text-sm">
              <span className="text-purple-600">Diastolic:</span> {data.diastolic} {unit}
            </p>
          </div>
        ) : (
          <p className="text-sm">
            <span className="font-medium">{title}:</span> {data.value} {unit}
          </p>
        )}
      </div>
    );
  };

  const getStatusColor = () => {
    if (!filteredData.length) return 'secondary';
    
    const latest = filteredData[filteredData.length - 1];
    let value: number | undefined;

    if (vitalType === 'bloodPressure') {
      value = latest.systolicBP;
    } else {
      value = latest[vitalType];
    }

    if (!value || !normalRange) return 'secondary';

    if (value < normalRange.min || value > normalRange.max) {
      return 'destructive';
    }

    return 'default';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              <Badge variant={getStatusColor()}>
                {filteredData.length} readings
              </Badge>
            </CardTitle>
            <CardDescription>
              {normalRange && `Normal range: ${normalRange.min}-${normalRange.max} ${unit}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {(['1h', '6h', '12h', '24h'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                interval={Math.floor(chartData.length / 6)}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Normal range bands */}
              {normalRange && (
                <>
                  <ReferenceLine
                    y={normalRange.max}
                    stroke="orange"
                    strokeDasharray="3 3"
                    label={{ value: 'High', fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={normalRange.min}
                    stroke="orange"
                    strokeDasharray="3 3"
                    label={{ value: 'Low', fontSize: 10 }}
                  />
                </>
              )}

              {vitalType === 'bloodPressure' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Systolic"
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Diastolic"
                    connectNulls
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name={title}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available for the selected time range
          </div>
        )}
      </CardContent>
    </Card>
  );
}
