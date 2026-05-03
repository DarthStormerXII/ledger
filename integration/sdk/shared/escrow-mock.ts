import type {
  Address,
  Bytes32,
  EscrowStatus,
  EscrowTask,
  Hex,
} from "./types.js";
import { randomBytes } from "node:crypto";

// In-memory faithful re-implementation of contracts/src/LedgerEscrow.sol.
// Same state machine, same revert reasons, same event semantics — sized to drive scenarios
// without spending live testnet gas. Live mode swaps this for the on-chain Contract calls.

export class MockEscrow {
  private readonly tasks = new Map<Bytes32, EscrowTask>();
  private readonly balances = new Map<Address, bigint>();
  public readonly txLog: {
    type: string;
    taskId: Bytes32;
    txHash: Hex;
    data?: unknown;
  }[] = [];

  postTask(input: {
    sender: Address;
    taskId: Bytes32;
    payment: bigint;
    deadline: number;
    minReputation: number;
    valueSent: bigint;
  }): Hex {
    if (
      input.taskId === "0x" + "00".repeat(32) ||
      this.tasks.has(input.taskId)
    ) {
      throw new Error("InvalidTask");
    }
    if (input.valueSent !== input.payment || input.payment === 0n)
      throw new Error("InvalidPayment");
    if (input.deadline <= Math.floor(Date.now() / 1000))
      throw new Error("InvalidTask");
    this.tasks.set(input.taskId, {
      taskId: input.taskId,
      buyer: input.sender,
      worker: null,
      payment: input.payment,
      deadline: input.deadline,
      minReputation: input.minReputation,
      bidAmount: 0n,
      bondAmount: 0n,
      resultHash: null,
      status: "Posted",
    });
    this.debit(input.sender, input.valueSent);
    return this.recordTx("postTask", input.taskId);
  }

  acceptBid(input: {
    sender: Address;
    taskId: Bytes32;
    workerAddress: Address;
    bidAmount: bigint;
    bondAmount: bigint;
    valueSent: bigint;
  }): Hex {
    const task = this.requireTask(input.taskId);
    if (task.status !== "Posted") throw new Error("InvalidStatus");
    if (
      input.sender !== input.workerAddress ||
      input.workerAddress ===
        ("0x0000000000000000000000000000000000000000" as Address)
    ) {
      throw new Error("InvalidTask");
    }
    if (
      input.valueSent !== input.bondAmount ||
      input.bondAmount === 0n ||
      input.bidAmount === 0n ||
      input.bidAmount > task.payment
    ) {
      throw new Error("InvalidPayment");
    }
    task.worker = input.workerAddress;
    task.bidAmount = input.bidAmount;
    task.bondAmount = input.bondAmount;
    task.status = "Accepted";
    this.debit(input.workerAddress, input.bondAmount);
    return this.recordTx("acceptBid", input.taskId);
  }

  releasePayment(input: {
    sender: Address;
    taskId: Bytes32;
    resultHash: Bytes32;
  }): Hex {
    const task = this.requireTask(input.taskId);
    if (task.status !== "Accepted") throw new Error("InvalidStatus");
    if (input.sender !== task.buyer) throw new Error("NotBuyer");
    if (!task.worker) throw new Error("InvalidStatus");
    task.status = "Released";
    task.resultHash = input.resultHash;
    this.credit(task.worker, task.bidAmount + task.bondAmount);
    if (task.payment > task.bidAmount) {
      this.credit(task.buyer, task.payment - task.bidAmount);
    }
    return this.recordTx("releasePayment", input.taskId, {
      resultHash: input.resultHash,
    });
  }

  slashBond(input: { taskId: Bytes32 }): Hex {
    const task = this.requireTask(input.taskId);
    if (task.status !== "Accepted") throw new Error("InvalidStatus");
    if (Math.floor(Date.now() / 1000) <= task.deadline)
      throw new Error("DeadlineActive");
    task.status = "Slashed";
    this.credit(task.buyer, task.payment + task.bondAmount);
    return this.recordTx("slashBond", input.taskId);
  }

  cancelTask(input: { sender: Address; taskId: Bytes32 }): Hex {
    const task = this.requireTask(input.taskId);
    if (task.status !== "Posted") throw new Error("InvalidStatus");
    if (input.sender !== task.buyer) throw new Error("NotBuyer");
    task.status = "Cancelled";
    this.credit(task.buyer, task.payment);
    return this.recordTx("cancelTask", input.taskId);
  }

  read(taskId: Bytes32): EscrowTask {
    return { ...this.requireTask(taskId) };
  }

  status(taskId: Bytes32): EscrowStatus {
    return this.tasks.get(taskId)?.status ?? "None";
  }

  balanceOf(addr: Address): bigint {
    return this.balances.get(addr) ?? 0n;
  }

  fund(addr: Address, amount: bigint): void {
    this.credit(addr, amount);
  }

  // Time travel for deadline-based scenarios. Advances all task deadlines into the past.
  expireAllDeadlines(): void {
    const past = Math.floor(Date.now() / 1000) - 3600;
    for (const t of this.tasks.values()) t.deadline = past;
  }

  private requireTask(taskId: Bytes32): EscrowTask {
    const t = this.tasks.get(taskId);
    if (!t) throw new Error("UnknownTask");
    return t;
  }

  private credit(addr: Address, amount: bigint): void {
    this.balances.set(addr, (this.balances.get(addr) ?? 0n) + amount);
  }

  private debit(addr: Address, amount: bigint): void {
    const cur = this.balances.get(addr) ?? 0n;
    if (cur < amount) {
      this.balances.set(addr, 0n);
      return;
    }
    this.balances.set(addr, cur - amount);
  }

  private recordTx(type: string, taskId: Bytes32, data?: unknown): Hex {
    const txHash = `0x${randomBytes(32).toString("hex")}` as Hex;
    this.txLog.push({ type, taskId, txHash, data });
    return txHash;
  }
}
