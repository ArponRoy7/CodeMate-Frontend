import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "/home/arpon-roy/Desktop/WebDevCodes/devtinder-frontend/src/utils/userSlice.js";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "/home/arpon-roy/Desktop/WebDevCodes/devtinder-frontend/src/utils/constants.js";

const Login = () => {
  const [emailId, setEmailId] = useState("Tom@gmail.com");
  const [password, setPassword] = useState("Arpon123#");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        {
          email: emailId,
          password,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      return navigate("/");
    }  catch (err) {
      console.error("Error during login:", err);
      console.log("Full error response:", err?.response);
    }
    
  };

  return (
    <div className="flex justify-center my-10">
      <div className="card bg-base-300 w-96 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Login</h2>
          <div>
            <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">Email ID:</span>
              </div>
              <input
                type="text"
                value={emailId}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setEmailId(e.target.value)}
              />
            </label>
            <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">Password</span>
              </div>
              <input
                type="text"
                value={password}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>
          <div className="card-actions justify-center m-2">
            <button className="btn btn-primary" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
