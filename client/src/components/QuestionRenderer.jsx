export default function QuestionRenderer({ question, value, onChange }) {
	switch (question.type) {
		case "text":
			return (
				<input
					type="text"
					className="form-input"
					value={value || ""}
					onChange={(e) => onChange(e.target.value)}
					placeholder="Your answer..."
				/>
			);

		case "multiple-choice":
			return (
				<div className="options-list">
					{question.options.map((opt) => (
						<label key={opt} className="option-label">
							<input
								type="radio"
								name={question.id}
								value={opt}
								checked={value === opt}
								onChange={() => onChange(opt)}
							/>
							<span>{opt}</span>
						</label>
					))}
				</div>
			);

		case "checkbox":
			return (
				<div className="options-list">
					{question.options.map((opt) => {
						const checked = Array.isArray(value) && value.includes(opt);
						return (
							<label key={opt} className="option-label">
								<input
									type="checkbox"
									checked={checked}
									onChange={() => {
										const current = Array.isArray(value) ? [...value] : [];
										if (checked) {
											onChange(current.filter((v) => v !== opt));
										} else {
											onChange([...current, opt]);
										}
									}}
								/>
								<span>{opt}</span>
							</label>
						);
					})}
				</div>
			);

		case "rating":
			return (
				<div className="rating-stars">
					{[1, 2, 3, 4, 5].map((star) => (
						<button
							key={star}
							type="button"
							className={`star-btn ${value >= star ? "active" : ""}`}
							onClick={() => onChange(star)}
						>
							★
						</button>
					))}
				</div>
			);

		default:
			return null;
	}
}
