// import { useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabaseClient";

// function parseHash(hash) {
//   const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
//   const obj = {};
//   p.forEach((v, k) => (obj[k] = v));
//   return obj;
// }

// export default function AuthCallback() {
//   const { hash, search } = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const go = async () => {
//       const hashParams = parseHash(hash);
//       const query = new URLSearchParams(search);

//       // handle error coming from Supabase
//       const error = hashParams.error || query.get("error");
//       const error_code = hashParams.error_code || query.get("error_code");

//       if (error) {
//         navigate(`/set-password?err=${error_code || error}`, { replace: true });
//         return;
//       }

//       const access_token = hashParams.access_token;
//       const refresh_token = hashParams.refresh_token;
//       const type = hashParams.type || query.get("type"); // invite / recovery

//       if (access_token && refresh_token) {
//         await supabase.auth.setSession({ access_token, refresh_token });
//         navigate(type === "invite" ? "/set-password" : "/set-password?mode=reset", {
//           replace: true,
//         });
//       } else {
//         navigate("/", { replace: true });
//       }
//     };
//     go();
//   }, [hash, search, navigate]);

//   return null;
// }

// import { useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// function parseHash(hash) {
//   const p = new URLSearchParams(hash?.startsWith("#") ? hash.slice(1) : hash || "");
//   const obj = {};
//   p.forEach((v, k) => (obj[k] = v));
//   return obj;
// }

// export default function AuthCallback() {
//   const { hash, search } = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const go = async () => {
//       const h = parseHash(hash);
//       const q = new URLSearchParams(search);

//       const error = h.error || q.get("error");
//       const error_code = h.error_code || q.get("error_code");
//       if (error) {
//         navigate(`/set-password?err=${encodeURIComponent(error_code || error)}`, { replace: true });
//         return;
//       }

//       const access_token = h.access_token;
//       const refresh_token = h.refresh_token;
//       const type = h.type || q.get("type") || "invite";

//       if (access_token && refresh_token) {
//         // Forward tokens in the hash so the next page sets the session itself.
//         const next = `/set-password#access_token=${encodeURIComponent(
//           access_token
//         )}&refresh_token=${encodeURIComponent(refresh_token)}&type=${encodeURIComponent(type)}`;
//         navigate(next, { replace: true });
//       } else {
//         navigate("/", { replace: true });
//       }
//     };
//     go();
//   }, [hash, search, navigate]);

//   return null;
// }


import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function parseHash(hash) {
  const p = new URLSearchParams(hash?.startsWith("#") ? hash.slice(1) : hash || "");
  const obj = {}; p.forEach((v, k) => (obj[k] = v)); return obj;
}

export default function AuthCallback() {
  const { hash, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const go = async () => {
      const h = parseHash(hash);
      const q = new URLSearchParams(search);

      const err = h.error || q.get("error");
      const code = h.error_code || q.get("error_code");
      if (err) {
        navigate(`/set-password?err=${encodeURIComponent(code || err)}`, { replace: true });
        return;
      }

      const at = h.access_token;
      const rt = h.refresh_token;
      const type = h.type || q.get("type") || "invite";

      if (at && rt) {
        // Forward tokens in the hash so /set-password can set the session itself.
        navigate(
          `/set-password#access_token=${encodeURIComponent(at)}&refresh_token=${encodeURIComponent(rt)}&type=${encodeURIComponent(type)}`,
          { replace: true }
        );
      } else {
        navigate("/", { replace: true });
      }
    };
    go();
  }, [hash, search, navigate]);

  return null;
}
