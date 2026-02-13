import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "https://dwjd-backend.onrender.com";

export default function YoutubeView() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/youtube/${id}`)
      .then(res => setData(res.data.content))
      .catch(err => console.error(err));
  }, [id]);

  if (!data) return null;

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
      <p className="mb-6 text-gray-300">{data.description}</p>

      <div dangerouslySetInnerHTML={{ __html: data.embedCode }} />

      <p className="mt-4 text-sm text-gray-400">
        👀 {data.views} views
      </p>
    </div>
  );
}
