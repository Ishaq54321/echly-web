"use client";

interface Props {
  name: string;
  avatar: string;
  message: string;
  time: string;
}

export default function CommentItem({
  name,
  avatar,
  message,
  time,
}: Props) {
  return (
    <div className="flex items-start gap-4 group">
      <img
        src={avatar}
        alt={name}
        className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {name}
          </span>
          <span className="text-xs text-gray-400">
            {time}
          </span>
        </div>

        <p className="mt-2 text-sm text-gray-700 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}