import React, { useState } from 'react';
import './Fat.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthstore } from '../../../stores/auth';
import HoverCard from './card';
import BackgroundGlow from './background_glow';


const Fat = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthstore();

  const handleStartCollaborating = () => {
    if (authUser) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  const handlePractice = () =>{
    navigate('/practice', { state:{
      setlang: "python"
    }})
  }

  return (
    <>
    <div className='gif-background'>
    <div className='fat relative'>
      

      <BackgroundGlow />

      <div className="textbox pt-36 pl-20">
        <h1>Code</h1>
        <h1>Compile</h1>
        <h1>Collaborate</h1>
        <div className="buttons flex gap-5 pt-5 pl-2">
          <button onClick={handleStartCollaborating}>
            Start Collaborating
          </button>
            <button onClick={handlePractice}>Practice</button>
        </div>
      </div>

      <div
        className="flex flex-col gap-2 absolute right-10 top-1/4"
        style={{ width: "auto" }}
      >
        <HoverCard text="What?" hoverText="This is a collaborative code compiling platform where multiple users can write and edit code together in real time." />
        <HoverCard text="Why?" hoverText="It allows teams, students, and coding enthusiasts to collaborate effortlessly, improving productivity and learning through shared problem-solving." />
        <HoverCard text="How?" hoverText="Users can create or join a coding room where they can write, edit, and compile code together in real time. The platform also offers LeetCode problems for coding practice." />
        <HoverCard text="When?" hoverText="Whenever you need to work on coding projects with others, practice interview questions, or learn by coding together." />
        <HoverCard text="Where?" hoverText="You can use the platform from anywhere with an internet connection, directly through your web browser." />
        <HoverCard text="Who?" hoverText="It is perfect for developers, students, interview candidates, and anyone who enjoys collaborative coding and problem-solving." />
      </div>


    </div>
    </div>
    </>
  );
}

export default Fat;
