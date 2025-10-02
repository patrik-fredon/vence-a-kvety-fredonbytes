/**
 * Gradient Test Component
 *
 * This component is used to test the centralized background gradient system.
 * It displays both funeral-gold and funeral-teal gradients in isolation.
 *
 * Usage: Import this component temporarily in any page to verify gradient rendering.
 * Remove after testing is complete.
 */

export function GradientTest() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-stone-900">
          Funeral Gold Gradient Test
        </h2>
        <div className="bg-funeral-gold h-64 rounded-lg flex items-center justify-center">
          <p className="text-2xl font-semibold text-stone-900">
            bg-funeral-gold
          </p>
        </div>
        <p className="mt-2 text-sm text-stone-600">
          Gradient: linear-gradient(to right, #AE8625, #F7EF8A, #D2AC47)
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-stone-900">
          Funeral Teal Gradient Test
        </h2>
        <div className="bg-funeral-teal h-64 rounded-lg flex items-center justify-center">
          <p className="text-2xl font-semibold text-white">
            bg-funeral-teal
          </p>
        </div>
        <p className="mt-2 text-sm text-stone-600">
          Gradient: linear-gradient(to right, #0f766e, #14b8a6, #0d9488)
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-stone-900">
          Text Readability Test
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-funeral-gold p-6 rounded-lg">
            <h3 className="text-xl font-bold text-stone-900 mb-2">
              Gold Gradient with Dark Text
            </h3>
            <p className="text-stone-800">
              This is a sample paragraph to test text readability on the gold gradient background.
              The text should be clearly visible and easy to read.
            </p>
          </div>
          <div className="bg-funeral-teal p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-2">
              Teal Gradient with Light Text
            </h3>
            <p className="text-stone-100">
              This is a sample paragraph to test text readability on the teal gradient background.
              The text should be clearly visible and easy to read.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-stone-900">
          Gradient Comparison
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-funeral-gold h-32 rounded-lg" />
          <div className="bg-funeral-teal h-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
