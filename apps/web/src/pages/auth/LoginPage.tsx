import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import api from "../../lib/api";
import { AtSign, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Zap, RefreshCw, Database } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email: email.trim(), password });
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ---- LEFT PANEL ---- */}
      <div className="login-left">

        <div>
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">CE</div>
            <span className="login-logo-name">CELEBISPACE</span>
          </div>

          {/* Hero */}
          <div className="login-hero">
            <h1>
              Làm chủ <br />
              <span className="hero-gradient">Cơ sở dữ liệu</span>
              <br />
              &amp; Kho hàng
            </h1>
            <p>
              Hệ thống quản trị hạ tầng kho vận hiện đại với khả năng xử lý
              dữ liệu quy mô lớn và bảo mật tuyệt đối.
            </p>
          </div>
        </div>

        {/* Feature cards */}
        <div className="login-features">
          <div className="login-feature-card">
            <div className="login-feature-icon violet"><ShieldCheck size={18} /></div>
            <h3>Bảo mật Quân đội</h3>
            <p>Mã hóa chuẩn đỉnh cao của Bộ Quốc phòng.</p>
          </div>
          <div className="login-feature-card">
            <div className="login-feature-icon fuchsia"><Zap size={18} /></div>
            <h3>Xử lý tốc độ</h3>
            <p>Tối ưu hoá query &amp; chỉ mục song song.</p>
          </div>
          <div className="login-feature-card">
            <div className="login-feature-icon blue"><RefreshCw size={18} /></div>
            <h3>Đồng bộ thời gian thực</h3>
            <p>Đồng bộ trạng thái tức thì trên toàn hệ thống.</p>
          </div>
          <div className="login-feature-card">
            <div className="login-feature-icon rose"><Database size={18} /></div>
            <h3>Đa kho</h3>
            <p>Quản lý không giới hạn điểm lưu kho.</p>
          </div>
        </div>

        {/* Footer */}
        <p className="login-footer-copy">© 2026 CELEBI TECH — KẾT CẤU VẬN HÀNH TOÀN CẦU</p>
      </div>

      {/* ---- RIGHT PANEL ---- */}
      <div className="login-right">
        <div className="login-card">

          {/* Heading */}
          <div className="login-card-head">
            <h2>Truy cập hệ thống</h2>
            <p>Vui lòng đăng nhập để vào Celebi</p>
          </div>

          {/* Error */}
          {error && <div className="login-error">{error}</div>}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="login-field">
              <label className="login-label">Email đăng nhập</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><AtSign size={18} /></span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  placeholder="ten@congty.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="login-field-header">
                <label className="login-label">Mật khẩu</label>
                <a href="#" className="login-forgot">Quên mật khẩu?</a>
              </div>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Lock size={18} /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input has-toggle"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="login-submit-btn">
              {loading
                ? <Loader2 size={20} className="animate-spin" />
                : <><span>Đăng nhập tài khoản</span><ArrowRight size={18} /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span className="login-divider-line" />
            <span className="login-divider-text">Đăng nhập nhanh</span>
            <span className="login-divider-line" />
          </div>

          {/* Quick login */}
          <div className="login-quick-btns">
            <button
              type="button"
              className="login-quick-btn"
              onClick={() => { setEmail("admin@celebi.com"); setPassword("Admin@123"); }}
            >
              <span className="login-quick-icon"><ShieldCheck size={18} /></span>
              <span className="login-quick-label">Siêu quản trị</span>
            </button>
            <button type="button" className="login-quick-btn">
              <span className="login-quick-icon"><Zap size={18} /></span>
              <span className="login-quick-label">Zender</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
