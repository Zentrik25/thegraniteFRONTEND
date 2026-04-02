"use client";

import { FormEvent, useState, useTransition } from "react";

import { getBrowserErrorMessage, browserJson } from "@/lib/api/browser";
import { formatRelativeTime } from "@/lib/format";
import type { CommentRecord } from "@/lib/types";

interface CommentsPanelProps {
  slug: string;
  initialComments: CommentRecord[];
  totalCount: number;
}

function CommentItem({ comment, depth = 0 }: { comment: CommentRecord; depth?: number }) {
  return (
    <div className={depth === 0 ? "comment-item" : ""}>
      <div>
        <span className="comment-author">{comment.author_name}</span>
        <span className="comment-date">{formatRelativeTime(comment.created_at)}</span>
      </div>
      <p className="comment-body">{comment.body}</p>
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsPanel({
  slug,
  initialComments,
  totalCount,
}: CommentsPanelProps) {
  const [comments, setComments] = useState(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  function submitComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      try {
        const newComment = await browserJson<CommentRecord>(
          `/api/v1/articles/${slug}/comments/`,
          {
            method: "POST",
            body: JSON.stringify({ author_name: name, author_email: email, body }),
          },
        );
        setComments((prev) => [newComment, ...prev]);
        setBody("");
        setFeedback({ type: "success", text: "Your comment has been submitted for moderation." });
      } catch (err) {
        setFeedback({
          type: "error",
          text: getBrowserErrorMessage(err, "Could not submit comment."),
        });
      }
    });
  }

  return (
    <section className="comments-section" aria-label="Comments">
      <h2 className="comments-heading">
        {totalCount > 0 ? `${totalCount} comment${totalCount !== 1 ? "s" : ""}` : "Comments"}
      </h2>

      {/* Comment form */}
      <form className="comment-form" onSubmit={submitComment}>
        <p className="comment-form-title">Join the conversation</p>
        <div className="form-field">
          <label className="form-label" htmlFor="comment-name">
            Name
          </label>
          <input
            id="comment-name"
            className="form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            placeholder="Your name"
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="comment-email">
            Email <span style={{ fontWeight: 400 }}>(not published)</span>
          </label>
          <input
            id="comment-email"
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="comment-body">
            Comment
          </label>
          <textarea
            id="comment-body"
            className="form-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            minLength={5}
            maxLength={1000}
            placeholder="Share your thoughts…"
          />
        </div>
        {feedback && (
          <p className={`form-feedback ${feedback.type}`}>{feedback.text}</p>
        )}
        <button className="btn-primary" disabled={isPending} type="submit">
          {isPending ? "Submitting…" : "Post comment"}
        </button>
      </form>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div style={{ marginTop: "1.5rem" }}>
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      ) : (
        <p className="meta" style={{ marginTop: "1rem" }}>
          No comments yet. Be the first.
        </p>
      )}
    </section>
  );
}
