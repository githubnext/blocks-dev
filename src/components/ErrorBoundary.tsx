import React from "react";

type ErrorBoundaryProps = {
  errorKey?: string;
  children: React.ReactNode;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  {
    hasError: boolean;
    errorMessage: string | null;
  }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.errorKey !== this.props.errorKey) {
      this.setState({ hasError: false, errorMessage: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col">
          <h1>Something went wrong.</h1>
          <p>{this.state.errorMessage || ""}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
