"use client";

import { FormEvent, useState, useTransition } from "react";

import { getBrowserErrorMessage } from "@/lib/api/browser";
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
        const res = await fetch(`/api/articles/${slug}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ author_name: name, author_email: email, body }),
        });
        const data = await res.json().catch(() => ({})) as Record<string, unknown>;
        if (!res.ok) {
          const msg =
            (data["detail"] as string) ||
            (data["error"] as string) ||
            (data["message"] as string) ||
            "Could not submit comment.";
          throw new Error(msg);
        }
        setComments((prev) => [data as unknown as CommentRecord, ...prev]);
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

      {/* Comment form card */}
      <div className="comment-form-card">
        <div className="comment-form-card-header">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Join the conversation
        </div>

        <form className="comment-form-inner" onSubmit={submitComment}>
          <div className="comment-form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="comment-name">Name</label>
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
                Email{" "}
                <span className="comment-form-note">(not published)</span>
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
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="comment-body">Comment</label>
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

          <div className="comment-form-footer">
            <p className="comment-form-policy">
              Comments are moderated before publication.
            </p>
            <button className="btn-primary" disabled={isPending} type="submit">
              {isPending ? "Submitting…" : "Post comment"}
            </button>
          </div>
        </form>
      </div>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="comment-list">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      ) : (
        <p className="meta comment-empty">No comments yet. Be the first.</p>
      )}
    </section>
  );
}
