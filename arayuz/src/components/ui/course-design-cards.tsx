import React from "react";

export interface CardData {
  id: number | string;
  colorClass: string; // "green" | "orange" | "blue" | "red"
  date: string;
  title: string;
  description: string;
  progressPercent: string; // çubuğun doluluğu, ör. "90%"
  progressValue: string; // yazı olarak gösterilen değer
  imgSrc1?: string;
  imgAlt1?: string;
  imgSrc2?: string;
  imgAlt2?: string;
  countdownText: string;
  // Eklenenler (isteğe bağlı): kartı gerçek bir derse bağlamak için
  href?: string; // "+" ve sayaç düğmesinin gideceği adres
  icon?: React.ReactNode; // başlığın yanındaki simge
  avatars?: React.ReactNode[]; // resim yerine özel avatarlar (ör. karakter SVG'si)
  done?: boolean;
  isNext?: boolean; // "sıradaki görev" vurgusu
}

export interface CardProps {
  data: CardData;
  style?: React.CSSProperties;
}

// Düzeltme: orijinal yolun son noktası yarım kalmıştı.
const EllipsisIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
      clipRule="evenodd"
    />
  </svg>
);

const AddIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
      clipRule="evenodd"
    />
  </svg>
);

export const CourseDesignCard: React.FC<CardProps> = ({ data, style }) => {
  const {
    colorClass,
    date,
    title,
    description,
    progressPercent,
    progressValue,
    imgSrc1,
    imgAlt1,
    imgSrc2,
    imgAlt2,
    countdownText,
    href = "#",
    icon,
    avatars,
    done,
    isNext,
  } = data;

  return (
    <article
      className={`card ${colorClass} ${done ? "is-done" : ""} ${isNext ? "is-next" : ""}`}
      style={{ ...style, ["--progress" as string]: progressPercent }}
    >
      {isNext ? <span className="next-badge">Sıradaki</span> : null}
      <div className="card-header">
        <div className="date">{date}</div>
        <span className="card-menu" aria-hidden="true"><EllipsisIcon /></span>
      </div>
      <div className="card-body">
        <h3>
          {icon ? <span className="card-icon" aria-hidden="true">{icon}</span> : null}
          {title}
        </h3>
        <p>{description}</p>
        <div className="progress" role="progressbar" aria-label={`${title} ilerleme`} aria-valuetext={progressValue}>
          <span>İlerleme</span>
          <div className="progress-bar"><i /></div>
          <span className="progress-value">{progressValue}</span>
        </div>
      </div>
      <div className="card-footer">
        <ul>
          {avatars?.map((a, i) => <li key={i} className="avatar">{a}</li>)}
          {imgSrc1 && (
            <li>
              <img src={imgSrc1} alt={imgAlt1 || "kullanıcı"} />
            </li>
          )}
          {imgSrc2 && (
            <li>
              <img src={imgSrc2} alt={imgAlt2 || "kullanıcı"} />
            </li>
          )}
          <li>
            <a href={href} className="btn-add" aria-label={`${title}: aç`}>
              <AddIcon />
            </a>
          </li>
        </ul>
        <a href={href} className="btn-countdown">{countdownText}</a>
      </div>
    </article>
  );
};

export default CourseDesignCard;
