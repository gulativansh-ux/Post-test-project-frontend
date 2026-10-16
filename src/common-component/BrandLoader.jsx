import { BRAND } from "../utility/consts";


export default function BrandLoader({ title, subtitle }) {
  return (
    <div className="brand-loader" role="status" aria-live="polite">
      <div className="brand-loader-card">
        <div className="brand-loader-mark">
          <span className="brand-loader-ring" />
          <img src={BRAND} alt="" className="brand-loader-logo" />
        </div>
        <p>{title}</p>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
    </div>
  );
}
