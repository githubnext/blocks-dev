import React from "react";

export class ErrorBoundary extends React.Component<
  {
    errorKey?: string;
    children: React.ReactNode;
  },
  {
    hasError: boolean;
    errorMessage: string | null;
  }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.errorKey !== this.props.errorKey) {
      this.setState({ hasError: false, errorMessage: null });
    }
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="flex flex-col">
          <h1>Something went wrong.</h1>
          <p>
            {/* @ts-ignore */}
            {this.state.errorMessage || ""}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
