export default function Layout({ left, right }) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {left}
        </div>
        <div className="space-y-6">
          {right}
        </div>
      </div>
    );
  }
  