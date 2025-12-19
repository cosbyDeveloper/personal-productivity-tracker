// src/lib/nextauth-utils.ts
export function getNextAuthSecret() {
	const secret = process.env.NEXTAUTH_SECRET;

	if (!secret) {
		throw new Error('NEXTAUTH_SECRET is not set');
	}

	// If secret is 64 chars (hex), convert to Uint8Array
	if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
		// Hex string to bytes
		const bytes = new Uint8Array(
			secret.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
		);
		return bytes;
	}

	// If secret is 44 chars (base64), decode it
	if (secret.length === 44) {
		try {
			const bytes = Buffer.from(secret, 'base64');
			return bytes;
		} catch {
			// Fall back to string
		}
	}

	// Fallback: return as string
	return secret;
}
