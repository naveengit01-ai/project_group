import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://dwjd-backend.onrender.com";

export default function YoutubeList() {
  const [list, setList] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/youtube-content`)
      .then(res => setList(res.data.contents))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">📺 YouTube Contents</h1>

      <div className="space-y-4">
        {list.map(item => (
          <div
            key={item._id}
            onClick={() =>
              window.open(`/youtube/${item._id}`, "_blank")
            }
            className="p-5 bg-white/10 rounded cursor-pointer hover:bg-white/20"
          >
            <h2 className="text-xl font-bold">{item.title}</h2>
            <p className="text-sm text-gray-400">{item.description}</p>
            <p className="text-xs mt-2">👀 {item.views} views</p>
          </div>
        ))}
      </div>
    </div>
  );
}
