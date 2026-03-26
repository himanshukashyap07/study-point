import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function CurriculumManager() {
  const [treeData, setTreeData] = useState<any>({});
  const [courses, setCourses] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [newCatInput, setNewCatInput] = useState("");
  const [publishing, setPublishing] = useState(false);

  // Inline rename state — replaces window.prompt
  const [renamingCat, setRenamingCat] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // States for adding resources post-creation
  const [resourceInputForVideo, setResourceInputForVideo] = useState<string | null>(null);
  const [resourceInputValue, setResourceInputValue] = useState("");

  const handleRename = (cat: string) => {
    if (!renameValue.trim() || renameValue.trim() === cat) {
      setRenamingCat(null);
      return;
    }
    const newName = renameValue.trim();
    if (treeData[newName]) {
      toast.error("A category with that name already exists");
      return;
    }
    const newTree: any = {};
    Object.keys(treeData).forEach(k => {
      newTree[k === cat ? newName : k] = treeData[k];
    });
    setTreeData(newTree);
    if (selectedCategory === cat) setSelectedCategory(newName);
    setRenamingCat(null);
    setRenameValue("");
    toast.success("Renamed locally. Click 'Save Config' to persist.");
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [currRes, courseRes, videoRes] = await Promise.all([
          axios.get('/api/curriculum'),
          axios.get('/api/courses'),
          axios.get('/api/videos')
        ]);
        
        if (currRes.data.success && currRes.data.data) {
          setTreeData(currRes.data.data);
        }
        if (courseRes.data.success) setCourses(courseRes.data.data);
        if (videoRes.data.success) setVideos(videoRes.data.data);
      } catch (e) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await axios.post("/api/curriculum", { treeData });
      if (res.data.success) toast.success("Root Categories Saved!");
    } catch (error) {
      toast.error("Error saving categories");
    } finally {
      setPublishing(false);
    }
  };

  const addRootCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    const newTree = { ...treeData };
    if (newTree[newCatInput]) return toast.error("Category already exists");
    newTree[newCatInput] = {};
    setTreeData(newTree);
    setNewCatInput("");
    toast.success("Category added, click Save to DB to persist.");
  };

  const deleteCategory = (cat: string) => {
    const newTree = { ...treeData };
    delete newTree[cat];
    setTreeData(newTree);
    if (selectedCategory === cat) setSelectedCategory(null);
    toast.success("Category removed temporarily. Save to DB to persist.");
  };

  const handleAddResource = async (e: React.FormEvent, videoId: string) => {
    e.preventDefault();
    if (!resourceInputValue.trim()) return;
    try {
      const res = await axios.post("/api/videos/resources", { videoId, resource: resourceInputValue.trim() });
      if (res.data.success) {
        toast.success("Resource added");
        setVideos(prev => prev.map(v => v._id === videoId ? { ...v, resources: res.data.data.resources } : v));
        setResourceInputForVideo(null);
        setResourceInputValue("");
      }
    } catch (err) {
      toast.error("Failed to add resource");
    }
  };

  const categories = Object.keys(treeData);
  const categoryCourses = courses.filter(c => c.category === selectedCategory);
  const courseVideos = videos.filter(v => v.courseId === selectedCourse?._id);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[700px] text-black">
      {/* Left Sidebar Tree */}
      <div className="w-full lg:w-1/3 border rounded-xl p-4 overflow-y-auto bg-white shadow-sm flex flex-col min-h-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-black">Dynamic Tree</h3>
          <button onClick={handlePublish} disabled={publishing} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow">
            {publishing ? "Saving..." : "Save Config"}
          </button>
        </div>

        <form onSubmit={addRootCategory} className="flex gap-2 mb-4">
          <input type="text" value={newCatInput} onChange={e => setNewCatInput(e.target.value)} placeholder="New Root Category" className="flex-1 border border-gray-300 px-3 py-1.5 text-sm rounded-lg focus:border-blue-500 outline-none" />
          <button type="submit" className="bg-gray-800 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-black font-bold h-[34px]">+</button>
        </form>

        <div className="space-y-1">
          {categories.map(cat => (
            <div key={cat} className="mb-1">
              <div className="flex justify-between group items-center">
                <button 
                  onClick={() => { setSelectedCategory(cat); setSelectedCourse(null); }}
                  className={`flex-1 text-left px-2 py-1.5 rounded transition ${selectedCategory === cat ? 'bg-blue-100 text-blue-800 font-bold' : 'hover:bg-gray-100'}`}
                >
                  📁 <span className="ml-1">{cat}</span>
                </button>
                <div className="opacity-0 group-hover:opacity-100 flex items-center pr-2 gap-1 overflow-hidden shrink-0">
                   <button onClick={() => { setRenamingCat(cat); setRenameValue(cat); }} className="text-blue-500 hover:bg-blue-50 px-2 py-1 rounded text-xs">✏</button>
                   <button onClick={() => deleteCategory(cat)} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs">🗑</button>
                </div>
              </div>

              {/* Inline rename input */}
              {renamingCat === cat && (
                <div className="flex gap-1 mt-1 px-2">
                  <input
                    autoFocus
                    type="text"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleRename(cat); if (e.key === "Escape") setRenamingCat(null); }}
                    className="flex-1 border border-blue-400 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button onClick={() => handleRename(cat)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">✓</button>
                  <button onClick={() => setRenamingCat(null)} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">✕</button>
                </div>
              )}
              
              {selectedCategory === cat && (
                <div className="ml-4 border-l-2 pl-2 mt-1 space-y-1">
                  {categoryCourses.length === 0 ? (
                    <p className="text-xs text-gray-400 py-1">No courses found</p>
                  ) : categoryCourses.map(course => (
                    <div key={course._id}>
                      <button 
                        onClick={() => setSelectedCourse(course)}
                        className={`w-full text-left px-2 py-1 text-sm rounded transition truncate ${selectedCourse?._id === course._id ? 'bg-purple-100 text-purple-800 font-bold' : 'hover:bg-gray-100'}`}
                      >
                        🎓 {course.title}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel View */}
      <div className="flex-1 border rounded-xl p-4 md:p-6 bg-white shadow-sm overflow-y-auto min-h-[400px]">
        {selectedCourse ? (
          <div className="animate-fade-in-up">
            <button onClick={() => setSelectedCourse(null)} className="text-blue-500 text-sm mb-4 font-semibold hover:underline">← Back to {selectedCategory}</button>
            <div className="flex items-start gap-6 border-b pb-6 mb-6">
              {selectedCourse.thumbnail ? (
                <img src={selectedCourse.thumbnail} alt="thumbnail" className="w-32 h-24 object-cover rounded-lg shadow" />
              ) : (
                <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">📚</div>
              )}
              <div>
                <h2 className="text-2xl font-black text-gray-900">{selectedCourse.title}</h2>
                <div className="flex gap-2 text-xs font-bold mt-2 text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">{selectedCourse.board}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">{selectedCourse.medium}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">{selectedCourse.class}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">{selectedCourse.subject}</span>
                </div>
                {selectedCourse.isFree ? (
                  <p className="text-green-600 font-bold mt-2">FREE COURSE</p>
                ) : (
                  <p className="text-blue-600 font-bold mt-2">Price: ₹{selectedCourse.price}</p>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Attached Videos ({courseVideos.length})</h3>
            <div className="grid grid-cols-1 gap-4">
              {courseVideos.map(video => (
                <div key={video._id} className="p-3 border rounded-xl hover:shadow-md transition bg-gray-50 group">
                   <div className="flex items-center gap-4">
                     {video.thumbnail ? (
                        <img src={video.thumbnail} alt="video" className="w-24 h-16 object-cover rounded-md" />
                     ) : (
                       <div className="w-24 h-16 bg-gray-200 rounded-md flex items-center justify-center">🎥</div>
                     )}
                     <div className="flex-1">
                       <p className="font-bold text-gray-900 line-clamp-1">{video.order}. {video.title}</p>
                       <p className="text-xs text-gray-500 flex justify-between mt-1">
                         <span>⏱ {video.duration} mins</span>
                         <span className="text-blue-500 truncate max-w-[200px]">{video.videoUrl}</span>
                       </p>
                     </div>
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setResourceInputForVideo(video._id);
                       }}
                       className="opacity-0 group-hover:opacity-100 bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white px-3 py-2 rounded-lg font-bold transition mr-2"
                     >
                       Add Resource
                     </button>
                     <button 
                       onClick={async (e) => {
                         e.stopPropagation();
                         if (confirm("Are you sure you want to delete this video?")) {
                           try {
                             const res = await axios.delete(`/api/videos?id=${video._id}`);
                             if (res.data.success) {
                               toast.success("Video deleted");
                               setVideos(prev => prev.filter(v => v._id !== video._id));
                             }
                           } catch (err) {
                             toast.error("Failed to delete video");
                           }
                         }
                       }}
                       className="opacity-0 group-hover:opacity-100 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-3 py-2 rounded-lg font-bold transition flex-shrink-0"
                     >
                       Delete
                     </button>
                   </div>
                   
                   {/* Inline Insert Resource Form */}
                   {resourceInputForVideo === video._id && (
                     <form onSubmit={(e) => handleAddResource(e, video._id)} className="mt-4 flex gap-2 w-full pl-[112px]">
                       <input autoFocus type="text" value={resourceInputValue} onChange={e => setResourceInputValue(e.target.value)} placeholder="Resource URL (e.g. PDF link)..." className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-purple-500" />
                       <button type="submit" className="bg-purple-600 text-white px-4 py-1.5 rounded text-sm font-bold">Save</button>
                       <button type="button" onClick={() => {setResourceInputForVideo(null); setResourceInputValue("");}} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded text-sm font-bold hover:bg-gray-300">Cancel</button>
                     </form>
                   )}

                   {/* Existing Resources List */}
                   {video.resources && video.resources.length > 0 && (
                     <div className="mt-2 pl-[112px] flex flex-wrap gap-2 text-xs">
                       {video.resources.map((res: string, i: number) => (
                          <a key={i} href={res} target="_blank" rel="noreferrer" className="bg-blue-50 border border-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition">Resource {i+1}</a>
                       ))}
                     </div>
                   )}
                </div>
              ))}
              {courseVideos.length === 0 && (
                <p className="text-gray-500 text-center py-6 border-2 border-dashed rounded-xl">No videos bound to this course. Add videos via the "Add Video" tab!</p>
              )}
            </div>
          </div>
        ) : selectedCategory ? (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Category: {selectedCategory}</h2>
            <p className="text-gray-500 mb-6">Select a course to view details and associated resources.</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
               {categoryCourses.map(course => (
                 <div key={course._id} onClick={() => setSelectedCourse(course)} className="border rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:shadow-lg transition flex flex-col items-center text-center">
                   {course.thumbnail ? (
                      <img src={course.thumbnail} alt="thumb" className="w-full h-32 object-cover rounded-md mb-3" />
                   ) : (
                     <div className="w-full h-32 bg-gray-100 rounded-md mb-3 flex items-center justify-center text-4xl">🎓</div>
                   )}
                   <p className="font-bold text-gray-800 line-clamp-2">{course.title}</p>
                 </div>
               ))}
               {categoryCourses.length === 0 && (
                 <div className="col-span-full py-10 text-center border-2 border-dashed rounded-xl text-gray-500">
                   No courses found in this category. Go to "Create Course" to add one!
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
             <div className="text-6xl mb-4 text-gray-200">🌳</div>
             <h2 className="text-2xl font-bold text-gray-400">Select a Category</h2>
             <p className="text-gray-400 max-w-sm">Click a root category on the left to view database-linked courses.</p>
          </div>
        )}
      </div>
    </div>
  );
}
