import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getUsersPerDay } from '../services/api';

export default function UserGraph() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stats = await getUsersPerDay();

      const filledData = fillMissingDays(stats);
      setData(filledData);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fillMissingDays = (stats) => {
    const result = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const existing = stats.find(s => s.date === dateString);
      result.push({
        date: dateString,
        count: existing ? existing.count : 0
      });
    }

    return result;
  };

  if (loading) {
    return <div style={styles.loading}>Loading graph...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Users Created (Last 7 Days)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Users Created" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#666',
  },
};
