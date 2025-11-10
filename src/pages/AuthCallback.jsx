import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function parseHash(hash) {
  const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const obj = {};
  p.forEach((v, k) => (obj[k] = v));
  return obj;
}

export default function AuthCallback() {
  const { hash, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const go = async () => {
      const hashParams = parseHash(hash);
      const query = new URLSearchParams(search);

      // handle error coming from Supabase
      const error = hashParams.error || query.get("error");
      const error_code = hashParams.error_code || query.get("error_code");

      if (error) {
        navigate(`/set-password?err=${error_code || error}`, { replace: true });
        return;
      }

      const access_token = hashParams.access_token;
      const refresh_token = hashParams.refresh_token;
      const type = hashParams.type || query.get("type"); // invite / recovery

      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        navigate(type === "invite" ? "/set-password" : "/set-password?mode=reset", {
          replace: true,
        });
      } else {
        navigate("/", { replace: true });
      }
    };
    go();
  }, [hash, search, navigate]);

  return null;
}
