import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, LogOut, Plus, Check, X, Eye } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [wardenPassword, setWardenPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginMode, setLoginMode] = useState('warden');

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('hostel_students');
    return saved ? JSON.parse(saved) : [];
  });
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('hostel_attendance');
    return saved ? JSON.parse(saved) : {};
  });
  const [newStudent, setNewStudent] = useState({ name: '', rollNo: '', mobile: '', branch: '', session: '', semester: '', photo: null });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('attendance');
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [filterSession, setFilterSession] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const fileInputRef = useRef(null);

  const videoRef = useRef(null);
  const videoRegisterRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraRegisterActive, setCameraRegisterActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [registerStream, setRegisterStream] = useState(null);
  const [wardenPass, setWardenPass] = useState('warden123');
  const [facingMode, setFacingMode] = useState('user');
  const [facingModeRegister, setFacingModeRegister] = useState('user');
  const [capturedPhotoToday, setCapturedPhotoToday] = useState({});

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (registerStream) {
        registerStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream, registerStream]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  // Save to localStorage whenever students or attendance changes
  useEffect(() => {
    localStorage.setItem('hostel_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('hostel_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      const newPass = prompt('Set new Warden Password (minimum 6 characters):');
      if (newPass && newPass.length >= 6) {
        setWardenPass(newPass);
        alert('✅ Warden password set successfully!');
        setAdminPassword('');
        setLoginMode('warden');
      } else {
        alert('❌ Password must be at least 6 characters!');
      }
    } else {
      alert('❌ Invalid admin password!');
    }
  };

  const handleWardenLogin = (e) => {
    e.preventDefault();
    if (wardenPassword === wardenPass) {
      setCurrentUser('warden');
      setWardenPassword('');
    } else {
      alert('❌ Invalid warden password!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    stopCamera();
    stopCameraRegister();
  };

  const startCamera = async () => {
    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      setCameraActive(true);
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => console.error('Play error:', err));
        }
      }, 100);
    } catch (err) {
      console.error('Camera error:', err);
      alert('❌ Camera access denied! Please allow camera in browser settings.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('Stopping track:', track);
        track.stop();
      });
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    setStream(null);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    setTimeout(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      console.log('Attendance capture - Video element:', video);
      console.log('Canvas element:', canvas);
      console.log('Stream:', stream);
      
      if (!video) {
        alert('❌ Video element not found! Camera start karo pehle.');
        return;
      }
      
      if (!canvas) {
        alert('❌ Canvas element not found!');
        return;
      }
      
      console.log('Video ready state:', video.readyState);
      console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
      
      // Check if video has loaded
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert('⏳ Camera loading... 2-3 seconds aur wait karo!');
        return;
      }
      
      try {
        // Set canvas size to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoData = canvas.toDataURL('image/jpeg', 0.9);
        
        // Mark that photo has been captured for today
        setCapturedPhotoToday({ ...capturedPhotoToday, [selectedDate]: true });
        
        console.log('Attendance photo captured successfully');
        alert('✅ Photo captured successfully! Ab students ka attendance mark kar sakte ho.');
      } catch (error) {
        console.error('Capture error:', error);
        alert('❌ Photo capture failed! Please try again.');
      }
    }, 100);
  };

  const startCameraRegister = async () => {
    try {
      // Stop existing stream if any
      if (registerStream) {
        registerStream.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingModeRegister,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setRegisterStream(mediaStream);
      setCameraRegisterActive(true);
      
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRegisterRef.current) {
          videoRegisterRef.current.srcObject = mediaStream;
          videoRegisterRef.current.play().catch(err => console.error('Play error:', err));
        }
      }, 100);
    } catch (err) {
      console.error('Camera error:', err);
      alert('❌ Camera access denied!');
    }
  };

  const stopCameraRegister = () => {
    if (registerStream) {
      registerStream.getTracks().forEach(track => {
        console.log('Stopping register track:', track);
        track.stop();
      });
    }
    if (videoRegisterRef.current) {
      videoRegisterRef.current.srcObject = null;
      videoRegisterRef.current.pause();
    }
    setRegisterStream(null);
    setCameraRegisterActive(false);
  };

  const capturePhotoRegister = () => {
    setTimeout(() => {
      const video = videoRegisterRef.current;
      const canvas = canvasRef.current;
      
      console.log('Capture attempt - Video element:', video);
      console.log('Canvas element:', canvas);
      console.log('Register stream:', registerStream);
      
      if (!video) {
        alert('❌ Video element not found! Camera start karo pehle.');
        return;
      }
      
      if (!canvas) {
        alert('❌ Canvas element not found!');
        return;
      }
      
      console.log('Video ready state:', video.readyState);
      console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
      
      // Check if video has loaded
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert('⏳ Camera loading... 2-3 seconds aur wait karo!');
        return;
      }
      
      try {
        // Set canvas size to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoData = canvas.toDataURL('image/jpeg', 0.9);
        
        console.log('Photo captured successfully, data length:', photoData.length);
        setNewStudent({ ...newStudent, photo: photoData });
        alert('✅ Photo captured successfully!');
      } catch (error) {
        console.error('Capture error:', error);
        alert('❌ Photo capture failed! Please try again.');
      }
    }, 100);
  };

  const switchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (cameraActive) {
      startCamera();
    }
  };

  const switchCameraRegister = () => {
    const newMode = facingModeRegister === 'user' ? 'environment' : 'user';
    setFacingModeRegister(newMode);
    if (cameraRegisterActive) {
      startCameraRegister();
    }
  };

  const registerNewStudent = () => {
    if (!newStudent.name || !newStudent.rollNo || !newStudent.mobile || !newStudent.branch || !newStudent.session || !newStudent.semester) {
      alert('❌ Saari details fill karo: Name, Roll No, Mobile, Branch, Session, Semester!');
      return;
    }
    
    if (newStudent.mobile.length !== 10 || isNaN(newStudent.mobile)) {
      alert('❌ Valid 10 digit mobile number daalo!');
      return;
    }
    
    // Check for duplicate mobile number
    const duplicateMobile = students.find(s => s.mobile === newStudent.mobile);
    if (duplicateMobile) {
      alert(`❌ Ye mobile number pehle se registered hai!\nStudent: ${duplicateMobile.name} (${duplicateMobile.rollNo})`);
      return;
    }
    
    if (!newStudent.photo) {
      alert('❌ Student ka photo capture karna zaroori hai!');
      return;
    }

    const newId = students.length > 0 ? Math.max(...students.map(s => s.id || 0)) + 1 : 1;
    const student = {
      id: newId,
      name: newStudent.name,
      rollNo: newStudent.rollNo,
      mobile: newStudent.mobile,
      branch: newStudent.branch,
      session: newStudent.session,
      semester: newStudent.semester,
      photo: newStudent.photo,
      registeredDate: selectedDate
    };

    const updatedStudents = [...students, student];
    const updatedAttendance = { ...attendance, [newId]: {} };
    
    setStudents(updatedStudents);
    setAttendance(updatedAttendance);
    setNewStudent({ name: '', rollNo: '', mobile: '', branch: '', session: '', semester: '', photo: null });
    stopCameraRegister();
    alert('✅ Student registered successfully!');
  };

  const markAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [selectedDate]: true }
    }));
  };

  const deleteStudent = (studentId) => {
    if (window.confirm('Kya aap sure ho? Student ka saara data delete ho jayega!')) {
      const updatedStudents = students.filter(s => s.id !== studentId);
      const updatedAttendance = { ...attendance };
      delete updatedAttendance[studentId];
      
      setStudents(updatedStudents);
      setAttendance(updatedAttendance);
      alert('✅ Student deleted successfully!');
    }
  };

  const unmarkAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [selectedDate]: false }
    }));
  };

  const getStudentStats = (studentId) => {
    let present = 0, absent = 0;
    if (attendance[studentId]) {
      Object.values(attendance[studentId]).forEach(status => {
        if (status === true) present++;
        else if (status === false) absent++;
      });
    }
    return { present, absent, total: present + absent };
  };

  const getAttendanceStats = (date) => {
    let present = 0;
    const filteredStudents = getFilteredStudents();
    filteredStudents.forEach(student => {
      if (attendance[student.id]?.[date] === true) present++;
    });
    return { present, absent: filteredStudents.length - present, total: filteredStudents.length };
  };

  const getFilteredStudents = () => {
    return students.filter(student => {
      if (filterSession !== 'all' && student.session !== filterSession) return false;
      if (filterBranch !== 'all' && student.branch !== filterBranch) return false;
      if (filterSemester !== 'all' && student.semester !== filterSemester) return false;
      return true;
    });
  };

  const downloadReport = (period) => {
    let csv = 'Date,Student Name,Roll No,Status\n';
    let startDate = new Date(selectedDate);
    let endDate = new Date(selectedDate);

    if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - startDate.getDay());
      endDate.setDate(startDate.getDate() + 6);
    } else if (period === 'monthly') {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    }

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      students.forEach(student => {
        const status = attendance[student.id]?.[dateKey] === true ? 'Present' : 'Absent';
        csv += `${dateKey},${student.name},${student.rollNo},${status}\n`;
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `attendance_${period}_${selectedDate}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Backup - Download all data as JSON
  const backupData = () => {
    const backupObj = {
      students: students,
      attendance: attendance,
      backupDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(backupObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hostel_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('✅ Backup successfully downloaded! File ko safe jagah save karo.');
  };

  // Restore - Upload and restore data from JSON
  const restoreData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupObj = JSON.parse(e.target.result);
        
        // Validate backup file
        if (!backupObj.students || !backupObj.attendance) {
          alert('❌ Invalid backup file!');
          return;
        }

        // Confirm before restore
        const confirmRestore = window.confirm(
          `⚠️ Warning: Current data replace ho jayega!\n\n` +
          `Backup Details:\n` +
          `- Students: ${backupObj.students.length}\n` +
          `- Backup Date: ${new Date(backupObj.backupDate).toLocaleString()}\n\n` +
          `Kya aap restore karna chahte ho?`
        );

        if (confirmRestore) {
          setStudents(backupObj.students);
          setAttendance(backupObj.attendance);
          alert('✅ Data successfully restored! Page refresh ho raha hai...');
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (error) {
        console.error('Restore error:', error);
        alert('❌ Backup file corrupt hai ya invalid hai!');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to br, #1e40af, #7c3aed)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: '40px',
          width: '100%',
          maxWidth: '450px'
        }}>
          <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '30px', fontSize: '32px' }}>
            🏥 Hostel Attendance
          </h1>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <button
              onClick={() => setLoginMode('warden')}
              style={{
                flex: 1,
                padding: '10px',
                background: loginMode === 'warden' ? '#1e40af' : '#e5e7eb',
                color: loginMode === 'warden' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Warden
            </button>
            <button
              onClick={() => setLoginMode('admin')}
              style={{
                flex: 1,
                padding: '10px',
                background: loginMode === 'admin' ? '#7c3aed' : '#e5e7eb',
                color: loginMode === 'admin' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Admin
            </button>
          </div>

          {loginMode === 'warden' ? (
            <form onSubmit={handleWardenLogin}>
              <input
                type="password"
                placeholder="Warden Password"
                value={wardenPassword}
                onChange={(e) => setWardenPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1e40af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin}>
              <input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Set Warden Password
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: '15px', color: '#6b7280', fontSize: '13px' }}>
            {loginMode === 'warden' ? 'Default: warden123' : 'Demo: admin123'}
          </p>
        </div>
      </div>
    );
  }

  if (selectedStudentProfile) {
    const student = students.find(s => s.id === selectedStudentProfile);
    const stats = getStudentStats(student.id);
    const attendancePercentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to br, #1e40af, #7c3aed)',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: '40px',
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          {student.photo && (
            <img
              src={student.photo}
              alt="Student"
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                marginBottom: '20px',
                border: '4px solid #1e40af',
                objectFit: 'cover'
              }}
            />
          )}

          <h2 style={{ color: '#1f2937', marginBottom: '10px' }}>{student.name}</h2>
          <p style={{ color: '#6b7280', marginBottom: '10px' }}>Roll No: {student.rollNo}</p>
          <p style={{ color: '#6b7280', marginBottom: '10px' }}>📱 Mobile: {student.mobile}</p>
          <p style={{ color: '#6b7280', marginBottom: '10px' }}>🎓 Branch: {student.branch}</p>
          <p style={{ color: '#6b7280', marginBottom: '10px' }}>📅 Session: {student.session}</p>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>📚 Semester: {student.semester}</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <div style={{ padding: '20px', background: '#dbeafe', borderRadius: '8px' }}>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>{stats.total}</p>
              <p style={{ color: '#1e40af', fontSize: '14px', margin: '5px 0 0 0' }}>Total Days</p>
            </div>
            <div style={{ padding: '20px', background: '#dcfce7', borderRadius: '8px' }}>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534', margin: 0 }}>{stats.present}</p>
              <p style={{ color: '#166534', fontSize: '14px', margin: '5px 0 0 0' }}>Present</p>
            </div>
            <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px' }}>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#991b1b', margin: 0 }}>{stats.absent}</p>
              <p style={{ color: '#991b1b', fontSize: '14px', margin: '5px 0 0 0' }}>Absent</p>
            </div>
          </div>

          <div style={{ marginBottom: '30px', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
            <p style={{ color: '#1e40af', fontWeight: 'bold', margin: 0 }}>
              Attendance: {attendancePercentage}%
            </p>
          </div>

          <button
            onClick={() => setSelectedStudentProfile(null)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#1e40af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const stats = getAttendanceStats(selectedDate);

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <nav style={{
        background: 'linear-gradient(to right, #1e40af, #7c3aed)',
        color: 'white',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>🏥 Hostel Attendance Portal</h1>
        <button
          onClick={handleLogout}
          style={{
            background: '#ef4444',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 30px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ padding: '30px', background: '#10b981', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, marginBottom: '10px' }}>Present Today</p>
            <p style={{ fontSize: '42px', fontWeight: 'bold', margin: 0 }}>{stats.present}</p>
          </div>
          <div style={{ padding: '30px', background: '#ef4444', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, marginBottom: '10px' }}>Absent Today</p>
            <p style={{ fontSize: '42px', fontWeight: 'bold', margin: 0 }}>{stats.absent}</p>
          </div>
          <div style={{ padding: '30px', background: '#3b82f6', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, marginBottom: '10px' }}>Total Students</p>
            <p style={{ fontSize: '42px', fontWeight: 'bold', margin: 0 }}>{stats.total}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'attendance' ? '#1e40af' : 'white',
              color: activeTab === 'attendance' ? 'white' : '#1f2937',
              border: activeTab === 'attendance' ? 'none' : '2px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📋 Attendance
          </button>
          <button
            onClick={() => setActiveTab('register')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'register' ? '#1e40af' : 'white',
              color: activeTab === 'register' ? 'white' : '#1f2937',
              border: activeTab === 'register' ? 'none' : '2px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} />
            Register
          </button>
          <button
            onClick={() => setActiveTab('download')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'download' ? '#1e40af' : 'white',
              color: activeTab === 'download' ? 'white' : '#1f2937',
              border: activeTab === 'download' ? 'none' : '2px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={18} />
            Reports
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'backup' ? '#1e40af' : 'white',
              color: activeTab === 'backup' ? 'white' : '#1f2937',
              border: activeTab === 'backup' ? 'none' : '2px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            💾 Backup
          </button>
        </div>

        {activeTab === 'attendance' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px' }}>Mark Attendance</h2>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Filters */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px', 
              marginBottom: '20px',
              padding: '20px',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1f2937' }}>Filter by Session:</label>
                <select
                  value={filterSession}
                  onChange={(e) => setFilterSession(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Sessions</option>
                  <option value="2022-25">2022-25</option>
                  <option value="2023-26">2023-26</option>
                  <option value="2024-27">2024-27</option>
                  <option value="2025-28">2025-28</option>
                  <option value="2026-29">2026-29</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1f2937' }}>Filter by Branch:</label>
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Branches</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="IT">IT</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Biotechnology">Biotechnology</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1f2937' }}>Filter by Semester:</label>
                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Semesters</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '10px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  width: '100%',
                  maxWidth: '300px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={startCamera}
                disabled={cameraActive}
                style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: cameraActive ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: cameraActive ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Camera size={18} />
                Start Camera
              </button>
              <button
                onClick={switchCamera}
                disabled={!cameraActive}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !cameraActive ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: !cameraActive ? 0.5 : 1
                }}
              >
                🔄 {facingMode === 'user' ? 'Back' : 'Front'} Camera
              </button>
              <button
                onClick={stopCamera}
                disabled={!cameraActive}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !cameraActive ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: !cameraActive ? 0.5 : 1
                }}
              >
                ⏹ Stop Camera
              </button>
            </div>

            {cameraActive && (
              <div style={{ 
                marginBottom: '20px', 
                padding: '20px',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '3px solid #1e40af',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }}>
                <h3 style={{ 
                  textAlign: 'center', 
                  color: '#1e40af', 
                  marginBottom: '15px',
                  fontSize: '18px'
                }}>
                  📹 Camera View
                </h3>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    maxWidth: '640px',
                    height: 'auto',
                    border: '4px solid #1e40af',
                    borderRadius: '8px',
                    background: '#000',
                    display: 'block',
                    margin: '0 auto'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginTop: '15px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={capturePhoto}
                    style={{
                      background: '#1e40af',
                      color: 'white',
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    📸 Capture Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    ⏹ Close Camera
                  </button>
                </div>
                <p style={{ 
                  textAlign: 'center',
                  color: '#6b7280', 
                  marginTop: '10px',
                  fontSize: '14px'
                }}>
                  👤 Student ka face camera mein dikhaao aur photo capture karo
                </p>
                {!capturedPhotoToday[selectedDate] && (
                  <p style={{ 
                    textAlign: 'center',
                    color: '#ef4444', 
                    marginTop: '10px',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}>
                    ⚠️ Photo capture karne ke baad hi attendance mark kar sakte ho!
                  </p>
                )}
                {capturedPhotoToday[selectedDate] && (
                  <p style={{ 
                    textAlign: 'center',
                    color: '#10b981', 
                    marginTop: '10px',
                    fontSize: '13px',
                    fontWeight: 'bold'
                  }}>
                    ✅ Photo captured! Ab attendance mark karo. (Ek baar mark hone ke baad change nahi hoga)
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'grid', gap: '15px' }}>
              {getFilteredStudents().length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                  {students.length === 0 ? 
                    'Koi student registered nahi hai. Pehle Register tab se student add karo.' :
                    'Selected filters ke liye koi student nahi mila. Filter change karo.'}
                </p>
              ) : (
                getFilteredStudents().map(student => (
                  <div key={student.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    borderLeft: '4px solid #1e40af',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '200px' }}>
                      {student.photo && (
                        <img
                          src={student.photo}
                          alt={student.name}
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #1e40af'
                          }}
                        />
                      )}
                      <div>
                        <h3 style={{ color: '#1f2937', margin: '0 0 5px 0' }}>{student.name}</h3>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 3px 0' }}>Roll: {student.rollNo}</p>
                        <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 3px 0' }}>📱 {student.mobile}</p>
                        <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 3px 0' }}>🎓 {student.branch}</p>
                        <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 3px 0' }}>📅 {student.session} | 📚 Sem {student.semester}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {attendance[student.id]?.[selectedDate] === undefined ? (
                        <>
                          <button
                            onClick={() => markAttendance(student.id)}
                            disabled={!capturedPhotoToday[selectedDate]}
                            style={{
                              background: !capturedPhotoToday[selectedDate] ? '#9ca3af' : '#10b981',
                              color: 'white',
                              padding: '8px 16px',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: !capturedPhotoToday[selectedDate] ? 'not-allowed' : 'pointer',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              opacity: !capturedPhotoToday[selectedDate] ? 0.6 : 1
                            }}
                          >
                            <Check size={16} />
                            Present
                          </button>
                          <button
                            onClick={() => unmarkAttendance(student.id)}
                            disabled={!capturedPhotoToday[selectedDate]}
                            style={{
                              background: !capturedPhotoToday[selectedDate] ? '#9ca3af' : '#ef4444',
                              color: 'white',
                              padding: '8px 16px',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: !capturedPhotoToday[selectedDate] ? 'not-allowed' : 'pointer',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              opacity: !capturedPhotoToday[selectedDate] ? 0.6 : 1
                            }}
                          >
                            <X size={16} />
                            Absent
                          </button>
                        </>
                      ) : (
                        <div style={{
                          padding: '8px 16px',
                          background: attendance[student.id]?.[selectedDate] ? '#dcfce7' : '#fee2e2',
                          color: attendance[student.id]?.[selectedDate] ? '#166534' : '#991b1b',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {attendance[student.id]?.[selectedDate] ? '✅ Present' : '❌ Absent'}
                          <span style={{ fontSize: '12px', marginLeft: '5px' }}>(Locked)</span>
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedStudentProfile(student.id)}
                        style={{
                          background: '#7c3aed',
                          color: 'white',
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => deleteStudent(student.id)}
                        style={{
                          background: '#dc2626',
                          color: 'white',
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <X size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'register' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '20px' }}>Register New Student</h2>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Student Name:</label>
              <input
                type="text"
                placeholder="Full Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Roll Number:</label>
              <input
                type="text"
                placeholder="Roll No"
                value={newStudent.rollNo}
                onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Mobile Number:</label>
              <input
                type="tel"
                placeholder="10 digit mobile number"
                value={newStudent.mobile}
                onChange={(e) => setNewStudent({ ...newStudent, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                maxLength="10"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Branch:</label>
              <select
                value={newStudent.branch}
                onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Branch</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="IT">IT</option>
                <option value="Chemical">Chemical</option>
                <option value="Biotechnology">Biotechnology</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Session:</label>
              <select
                value={newStudent.session}
                onChange={(e) => setNewStudent({ ...newStudent, session: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Session</option>
                <option value="2022-25">2022-25 (Passout: 2025)</option>
                <option value="2023-26">2023-26 (Passout: 2026)</option>
                <option value="2024-27">2024-27 (Passout: 2027)</option>
                <option value="2025-28">2025-28 (Passout: 2028)</option>
                <option value="2026-29">2026-29 (Passout: 2029)</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Semester:</label>
              <select
                value={newStudent.semester}
                onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Semester</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Student Photo:</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={startCameraRegister}
                  disabled={cameraRegisterActive}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: cameraRegisterActive ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: cameraRegisterActive ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Camera size={18} />
                  Start Camera
                </button>
                <button
                  onClick={switchCameraRegister}
                  disabled={!cameraRegisterActive}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: !cameraRegisterActive ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: !cameraRegisterActive ? 0.5 : 1
                  }}
                >
                  🔄 {facingModeRegister === 'user' ? 'Back' : 'Front'}
                </button>
                <button
                  onClick={stopCameraRegister}
                  disabled={!cameraRegisterActive}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: !cameraRegisterActive ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: !cameraRegisterActive ? 0.5 : 1
                  }}
                >
                  ⏹ Stop
                </button>
              </div>

              {cameraRegisterActive && (
                <div style={{ 
                  marginBottom: '20px',
                  padding: '20px',
                  background: '#f9fafb',
                  borderRadius: '12px',
                  border: '3px solid #10b981',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}>
                  <h3 style={{ 
                    textAlign: 'center', 
                    color: '#10b981', 
                    marginBottom: '15px',
                    fontSize: '18px'
                  }}>
                    📹 Registration Camera
                  </h3>
                  <video
                    ref={videoRegisterRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={(e) => {
                      console.log('Register video metadata loaded', e.target.videoWidth, e.target.videoHeight);
                    }}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      height: 'auto',
                      minHeight: '300px',
                      border: '4px solid #10b981',
                      borderRadius: '8px',
                      background: '#000',
                      display: 'block',
                      margin: '0 auto',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    marginTop: '15px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={capturePhotoRegister}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      📸 Capture Photo
                    </button>
                    <button
                      onClick={stopCameraRegister}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}
                    >
                      ⏹ Close Camera
                    </button>
                  </div>
                  <p style={{ 
                    textAlign: 'center',
                    color: '#6b7280', 
                    marginTop: '10px',
                    fontSize: '14px'
                  }}>
                    👤 Student ka face saamne rakho aur clearly capture karo
                  </p>
                </div>
              )}

              {newStudent.photo && (
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <p style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>
                    ✅ Photo Successfully Captured!
                  </p>
                  <img
                    src={newStudent.photo}
                    alt="Student Photo"
                    style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '50%',
                      border: '4px solid #10b981',
                      objectFit: 'cover',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={registerNewStudent}
              style={{
                width: '100%',
                padding: '12px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✅ Register Student
            </button>
          </div>
        )}

        {activeTab === 'download' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '20px' }}>Download Reports</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => downloadReport('daily')}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Download size={18} />
                📅 Download Daily Report
              </button>

              <button
                onClick={() => downloadReport('weekly')}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: '#a855f7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Download size={18} />
                📊 Download Weekly Report
              </button>

              <button
                onClick={() => downloadReport('monthly')}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Download size={18} />
                📈 Download Monthly Report
              </button>
            </div>

            <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
              <p style={{ color: '#1e40af', margin: 0, fontWeight: 'bold' }}>
                📄 CSV Format: Reports CSV mein download hongi jo Excel mein khol sakte ho
              </p>
            </div>

            <div style={{ marginTop: '15px', padding: '15px', background: '#fef3c7', borderRadius: '8px' }}>
              <p style={{ color: '#92400e', margin: 0, fontWeight: 'bold' }}>
                💡 Principal ko easily bhej sakte ho ya Excel file print karke rakh sakte ho
              </p>
            </div>
          </div>
        )}

        {/* ===== BACKUP/RESTORE TAB ===== */}
        {activeTab === 'backup' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '20px' }}>💾 Backup & Restore</h2>

            <div style={{ marginBottom: '30px', padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
              <h3 style={{ color: '#92400e', margin: '0 0 10px 0', fontSize: '18px' }}>⚠️ Important</h3>
              <p style={{ color: '#92400e', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
                Browser data clear hone se pehle backup download kar lo. Agar data delete ho gaya, toh backup file se restore kar sakte ho!
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              <button
                onClick={backupData}
                disabled={students.length === 0}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: students.length === 0 ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: students.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  opacity: students.length === 0 ? 0.6 : 1
                }}
              >
                <Download size={20} />
                📥 Download Backup ({students.length} Students)
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={restoreData}
                style={{ display: 'none' }}
              />

              <button
                onClick={() => fileInputRef.current.click()}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                ⬆️ Upload & Restore Backup
              </button>
            </div>

            <div style={{ marginBottom: '20px', padding: '20px', background: '#dbeafe', borderRadius: '8px' }}>
              <h3 style={{ color: '#1e40af', margin: '0 0 15px 0', fontSize: '16px' }}>📋 Current Data Stats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <p style={{ color: '#1e40af', margin: 0, fontSize: '14px' }}>Total Students:</p>
                  <p style={{ color: '#1e40af', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{students.length}</p>
                </div>
                <div>
                  <p style={{ color: '#1e40af', margin: 0, fontSize: '14px' }}>Total Records:</p>
                  <p style={{ color: '#1e40af', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                    {Object.keys(attendance).reduce((sum, key) => sum + Object.keys(attendance[key]).length, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
              <h3 style={{ color: '#1e40af', margin: '0 0 10px 0', fontSize: '16px' }}>💡 How to Use:</h3>
              <ol style={{ color: '#1e40af', margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
                <li><strong>Backup:</strong> "Download Backup" button click karo - JSON file download hogi</li>
                <li><strong>Save File:</strong> Downloaded file ko safe place (Google Drive/USB) mein save karo</li>
                <li><strong>Restore:</strong> Agar data delete ho gaya, "Upload & Restore" se file upload karo</li>
                <li><strong>Regular Backups:</strong> Har week backup lena mat bhoolna!</li>
              </ol>
            </div>

            <div style={{ marginTop: '20px', padding: '15px', background: '#fee2e2', borderRadius: '8px' }}>
              <p style={{ color: '#991b1b', margin: 0, fontSize: '13px', fontWeight: 'bold' }}>
                ⚠️ Warning: Restore karne se current data replace ho jayega. Pehle current data ka backup le lo!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;